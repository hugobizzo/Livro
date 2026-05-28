"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, Download, Mail, QrCode, ShieldAlert } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { Timeline } from "@/components/timeline";
import { money } from "@/lib/format";
import { getOrder } from "@/lib/mock-data";
import { getPrototypeOrder, type PrototypeOrder } from "@/lib/prototype-store";
import type { BookOrder } from "@/lib/types";

type AdminVisibleOrder = (BookOrder & { generationCostLabel?: number }) | PrototypeOrder;

export function AdminOrderClient({ orderId }: { orderId: string }) {
  const [localOrder, setLocalOrder] = useState<PrototypeOrder | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const nextOrder = getPrototypeOrder(orderId) ?? null;
      if (nextOrder) {
        setLocalOrder(nextOrder);
        return;
      }

      try {
        const response = await fetch(`/api/orders/${orderId}`);
        if (!response.ok) return;
        const payload = (await response.json()) as { order?: PrototypeOrder | null };
        setLocalOrder(payload.order ?? null);
      } catch {
        setLocalOrder(null);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, [orderId]);

  const fallbackOrder = getOrder(orderId);
  const order = localOrder ?? fallbackOrder;

  if (!order) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f5f63]">
          <ArrowLeft className="size-4" aria-hidden="true" />
          Voltar ao admin
        </Link>
        <section className="mt-6 rounded-3xl border border-[#d9ddd9] bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold text-[#173331]">Pedido nao encontrado</h1>
          <p className="mt-2 text-sm text-[#68716e]">
            Este prototipo ainda salva pedidos locais no navegador atual.
          </p>
        </section>
      </main>
    );
  }

  return <AdminOrderDetail order={order} />;
}

function AdminOrderDetail({ order }: { order: AdminVisibleOrder }) {
  const generationCost = "generationCost" in order ? order.generationCost : order.aiCost;
  const [operationalNotice, setOperationalNotice] = useState("");

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0f5f63]">
        <ArrowLeft className="size-4" aria-hidden="true" />
        Voltar ao admin
      </Link>

      <section className="mt-6 grid gap-6 lg:grid-cols-[1fr_380px]">
        <div className="rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="flex flex-wrap gap-2">
                <StatusPill value={order.stage} />
                <StatusPill value={order.financialStatus} />
              </div>
              <h1 className="mt-5 text-3xl font-semibold text-[#173331]">{order.id}</h1>
              <p className="mt-2 text-[#68716e]">
                {order.title} · {order.customer} · {order.city}
              </p>
            </div>
            <div className="rounded-2xl bg-[#fbf8f1] p-4 text-sm text-[#59635f]">
              <strong className="block text-[#173331]">{order.serialCode}</strong>
              QR: /q/{order.publicCode}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-4">
            {[
              ["Preco", money(order.price)],
              ["Geracao", money(generationCost)],
              ["Grafica", money(order.printCost)],
              ["Margem", money(order.margin)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#edf0ec] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#68716e]">{label}</p>
                <p className="mt-2 text-xl font-semibold text-[#173331]">{value}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div>
              <h2 className="text-xl font-semibold text-[#173331]">Linha do tempo</h2>
              <div className="mt-5">
                <Timeline items={order.timeline} />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-semibold text-[#173331]">Aprovacoes</h2>
              <div className="mt-5 space-y-3">
                {order.approvals.map((approval) => (
                  <div key={approval.label} className="rounded-2xl bg-[#fbf8f1] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-semibold text-[#173331]">{approval.label}</span>
                      <StatusPill value={approval.status} />
                    </div>
                    <p className="mt-2 text-sm text-[#68716e]">
                      {approval.revisionsUsed}/{approval.revisionsLimit} revisoes usadas
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[#173331]">Acoes operacionais</h2>
            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() =>
                  setOperationalNotice(
                    "Pacote de impressao ainda nao esta automatizado. Proximo passo: gerar PDF fechado, QR e ZIP da grafica."
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#173331] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
              >
                <Download className="size-4" aria-hidden="true" />
                Gerar pacote ZIP
              </button>
              <button
                type="button"
                onClick={() =>
                  setOperationalNotice(
                    "Envio para grafica depende do cadastro da grafica parceira e do e-mail/API de recebimento."
                  )
                }
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-4 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
              >
                <Mail className="size-4" aria-hidden="true" />
                Enviar para grafica
              </button>
              <Link
                href={`/q/${order.publicCode}`}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-4 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
              >
                <QrCode className="size-4" aria-hidden="true" />
                Abrir QR publico
              </Link>
            </div>
            {operationalNotice && (
              <div className="mt-4 rounded-2xl border border-[#f1d394] bg-[#fff4dc] p-4 text-sm font-medium text-[#7a5012]">
                {operationalNotice}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-[#efb7ad] bg-[#fde7e3] p-6 text-[#9a3f2f]">
            <ShieldAlert className="size-6" aria-hidden="true" />
            <h2 className="mt-4 font-semibold">LGPD e retencao</h2>
            <p className="mt-2 text-sm leading-6">
              Fotos originais devem ser apagadas 30 dias apos entrega. URLs publicas nao podem expor dados da crianca.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
