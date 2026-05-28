"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Edit3,
  MessageCircle,
  RotateCcw,
  Save,
} from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Timeline } from "@/components/timeline";
import {
  addSupportNote,
  approveStory,
  getPrototypeOrder,
  replaceStory,
  requestStoryRevision,
  updatePrototypeOrder,
  type PrototypeOrder,
  type PrototypeStoryPage,
} from "@/lib/prototype-store";

export function CustomerOrderClient({ orderId }: { orderId: string }) {
  const [order, setOrder] = useState<PrototypeOrder | null>(null);
  const [draftStory, setDraftStory] = useState<PrototypeStoryPage[]>([]);
  const [storyEditing, setStoryEditing] = useState(false);
  const [revisionOpen, setRevisionOpen] = useState(false);
  const [supportOpen, setSupportOpen] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const nextOrder = getPrototypeOrder(orderId) ?? null;
      if (nextOrder) {
        setOrder(nextOrder);
        setDraftStory(nextOrder.story);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) {
          setOrder(null);
          setDraftStory([]);
          return;
        }

        const payload = (await response.json()) as { order?: PrototypeOrder | null };
        setOrder(payload.order ?? null);
        setDraftStory(payload.order?.story ?? []);
      } catch {
        setOrder(null);
        setDraftStory([]);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [orderId]);

  function persist(nextOrder: PrototypeOrder) {
    updatePrototypeOrder(nextOrder);
    setOrder(nextOrder);
    setDraftStory(nextOrder.story);
  }

  function updateDraftPage(pageNumber: number, patch: Partial<PrototypeStoryPage>) {
    setDraftStory((current) =>
      current.map((page) => (page.pageNumber === pageNumber ? { ...page, ...patch } : page))
    );
  }

  function saveStoryEdits() {
    if (!order) return;
    persist(replaceStory(order, draftStory));
    setStoryEditing(false);
  }

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/cliente" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f5f63]">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar
        </Link>
        <section className="mt-6 rounded-3xl border border-[#d9ddd9] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[#173331]">Pedido nao encontrado</h1>
          <p className="mt-2 text-sm text-[#68716e]">
            Entre na conta usada na compra ou crie um novo livro para testar o fluxo.
          </p>
          <Link
            href="/novo-livro"
            className="mt-6 inline-flex rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white"
          >
            Criar novo livro
          </Link>
        </section>
      </main>
    );
  }

  const storyApproval = order.approvals.find((approval) => approval.label === "Historia");
  const canAskRevision = !storyApproval || storyApproval.revisionsUsed < storyApproval.revisionsLimit;

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/cliente" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f5f63]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar
      </Link>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-3xl border border-[#d9ddd9] bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill value={order.stage} />
                <StatusPill value={order.financialStatus} />
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-[#173331]">{order.title}</h1>
              <p className="mt-2 text-[#68716e]">
                Criado para {order.childName}. Serial {order.serialCode}.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDraftStory(order.story);
                setStoryEditing((current) => !current);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-4 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
            >
              <Edit3 className="size-4" aria-hidden="true" />
              {storyEditing ? "Fechar edicao" : "Editar historia"}
            </button>
          </div>

          <div className="mt-8 rounded-3xl bg-[#fbf8f1] p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
                  Historia para aprovar
                </p>
                <p className="mt-1 text-sm text-[#68716e]">
                  {storyEditing ? "Ajuste texto e cena antes de salvar." : "Leia como ficaria no livro."}
                </p>
              </div>
              {storyEditing && (
                <button
                  type="button"
                  onClick={saveStoryEdits}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173331] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
                >
                  <Save className="size-4" aria-hidden="true" />
                  Salvar ajustes
                </button>
              )}
            </div>

            <div className="mt-5 grid gap-4">
              {(storyEditing ? draftStory : order.story).map((page) => (
                <StoryPageCard
                  key={page.pageNumber}
                  page={page}
                  editing={storyEditing}
                  onChange={(patch) => updateDraftPage(page.pageNumber, patch)}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => persist(approveStory(order))}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
            >
              <CheckCircle2 className="size-4" aria-hidden="true" />
              Aprovar historia
            </button>
            <button
              disabled={!canAskRevision}
              onClick={() => {
                setRevisionOpen((current) => !current);
                setSupportOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-5 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1] disabled:opacity-45"
            >
              <RotateCcw className="size-4" aria-hidden="true" />
              Pedir revisao
            </button>
            <button
              onClick={() => {
                setSupportOpen((current) => !current);
                setRevisionOpen(false);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-5 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
            >
              <MessageCircle className="size-4" aria-hidden="true" />
              Falar com suporte
            </button>
          </div>

          {(revisionOpen || supportOpen) && (
            <div className="mt-5 rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] p-4">
              <label className="block">
                <span className="text-sm font-semibold text-[#40504c]">
                  {revisionOpen ? "O que precisa mudar na historia?" : "Como podemos ajudar?"}
                </span>
                <textarea
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  rows={4}
                  className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-white p-4 text-sm outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
                  placeholder="Escreva com suas palavras..."
                />
              </label>
              <button
                onClick={() => {
                  const nextOrder = revisionOpen
                    ? requestStoryRevision(order, note)
                    : addSupportNote(order, note);
                  persist(nextOrder);
                  setNote("");
                  setRevisionOpen(false);
                  setSupportOpen(false);
                }}
                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#173331] px-5 py-2.5 text-sm font-semibold text-white"
              >
                <Save className="size-4" aria-hidden="true" />
                Registrar
              </button>
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#173331]">Linha do tempo</h2>
            <div className="mt-6">
              <Timeline items={order.timeline} />
            </div>
          </div>

          <div className="rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
            <h3 className="font-semibold text-[#173331]">Aprovacoes</h3>
            <div className="mt-4 space-y-3">
              {order.approvals.map((approval) => (
                <div key={approval.label} className="rounded-2xl bg-[#fbf8f1] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-[#40504c]">{approval.label}</span>
                    <StatusPill value={approval.status} />
                  </div>
                  <p className="mt-2 text-xs text-[#68716e]">
                    {approval.revisionsUsed}/{approval.revisionsLimit} revisoes usadas
                  </p>
                </div>
              ))}
            </div>
            {storyApproval?.status === "blocked" && (
              <div className="mt-5 rounded-2xl border border-[#efb7ad] bg-[#fde7e3] p-4 text-sm text-[#9a3f2f]">
                O limite de revisoes gratuitas desta etapa foi atingido. O pedido entrou para analise manual.
              </div>
            )}
          </div>

          {order.supportNotes.length > 0 && (
            <div className="rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
              <h3 className="font-semibold text-[#173331]">Registros</h3>
              <div className="mt-4 space-y-3">
                {order.supportNotes.map((item, index) => (
                  <p key={`${item}-${index}`} className="rounded-2xl bg-[#fff4dc] p-4 text-sm text-[#7a5012]">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          )}
        </aside>
      </section>
    </main>
  );
}

function StoryPageCard({
  page,
  editing,
  onChange,
}: {
  page: PrototypeStoryPage;
  editing: boolean;
  onChange: (patch: Partial<PrototypeStoryPage>) => void;
}) {
  return (
    <article className="rounded-2xl border border-[#e5e3dc] bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-[#173331]">Pagina {page.pageNumber}</h2>
        <span className="rounded-full bg-[#e8f2f4] px-3 py-1 text-xs font-semibold text-[#0f5f63]">
          {page.emotion}
        </span>
      </div>

      {editing ? (
        <div className="mt-4 grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#68716e]">Cena</span>
            <textarea
              value={page.scene}
              onChange={(event) => onChange({ scene: event.target.value })}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] p-4 text-sm leading-6 outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-[0.08em] text-[#68716e]">Texto</span>
            <textarea
              value={page.text}
              onChange={(event) => onChange({ text: event.target.value })}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] p-4 text-base leading-7 outline-none focus:border-[#0f5f63] focus:ring-4 focus:ring-[#cde5e8]"
            />
          </label>
        </div>
      ) : (
        <>
          <p className="mt-4 text-sm leading-6 text-[#59635f]">
            <strong className="text-[#173331]">Cena:</strong> {page.scene}
          </p>
          <p className="mt-4 text-lg leading-8 text-[#173331]">&ldquo;{page.text}&rdquo;</p>
        </>
      )}
    </article>
  );
}
