"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowRight, BookOpen, Clock3, MessageSquareText, PlusCircle } from "lucide-react";
import { StatusPill } from "@/components/status-pill";
import { listPrototypeOrders, type PrototypeOrder } from "@/lib/prototype-store";

export default function CustomerPage() {
  const [orders, setOrders] = useState<PrototypeOrder[]>([]);
  const [notice, setNotice] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const localOrders = listPrototypeOrders();
      setOrders(localOrders);

      try {
        const response = await fetch("/api/orders");
        if (response.status === 401) {
          setNotice("Entre na conta para ver pedidos salvos online.");
          return;
        }

        if (!response.ok) return;

        const payload = (await response.json()) as { orders?: PrototypeOrder[] };
        const onlineOrders = payload.orders ?? [];
        setOrders(mergeOrders(onlineOrders, localOrders));
        setNotice(onlineOrders.length ? "Pedidos carregados da conta." : "");
      } catch {
        setNotice("");
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const currentOrder = orders[0];

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
              Area do cliente
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#173331]">
              {currentOrder ? "Seu livro esta em producao." : "Comece criando seu primeiro livro."}
            </h1>
            <p className="mt-2 text-[#68716e]">
              {currentOrder
                ? `Pedido ${currentOrder.id} · ${currentOrder.title}`
                : "Os pedidos criados neste prototipo ficam salvos neste navegador."}
            </p>
          </div>
          <Link
            href={currentOrder ? `/cliente/pedidos/${currentOrder.id}` : "/novo-livro"}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
          >
            {currentOrder ? "Revisar pedido" : "Criar livro"}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
        {notice && (
          <div className="mt-5 rounded-2xl border border-[#f1d394] bg-[#fff4dc] p-4 text-sm font-medium text-[#7a5012]">
            {notice}
          </div>
        )}
      </section>

      {currentOrder ? (
        <section className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            [BookOpen, "Historia", currentOrder.statusLabel, currentOrder.stage],
            [MessageSquareText, "Revisoes", "2 gratuitas por etapa; nas paginas, 2 por pagina", "revision_requested"],
            [Clock3, "Prazo", `Estimativa: ${currentOrder.dueDate}`, "waiting"],
          ].map(([Icon, title, text, status]) => {
            const LucideIcon = Icon as typeof BookOpen;
            return (
              <div key={title as string} className="rounded-2xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
                <LucideIcon className="size-6 text-[#0f5f63]" aria-hidden="true" />
                <h2 className="mt-5 font-semibold text-[#173331]">{title as string}</h2>
                <p className="mt-2 text-sm text-[#68716e]">{text as string}</p>
                <div className="mt-5">
                  <StatusPill value={status as never} />
                </div>
              </div>
            );
          })}
        </section>
      ) : (
        <section className="mt-8 rounded-3xl border border-dashed border-[#c8cec9] bg-white p-8 text-center">
          <PlusCircle className="mx-auto size-10 text-[#0f5f63]" aria-hidden="true" />
          <h2 className="mt-5 text-2xl font-semibold text-[#173331]">Nenhum pedido criado nesta sessao</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-[#68716e]">
            Crie um livro pelo wizard para testar aprovacao de historia, personagens, revisoes e acompanhamento.
          </p>
          <Link
            href="/novo-livro"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
          >
            Criar novo livro
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </section>
      )}

      {orders.length > 1 && (
        <section className="mt-8 rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#173331]">Outros pedidos</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {orders.slice(1).map((order) => (
              <Link
                href={`/cliente/pedidos/${order.id}`}
                key={order.id}
                className="rounded-2xl border border-[#edf0ec] p-4 transition hover:bg-[#fbf8f1]"
              >
                <span className="font-semibold text-[#173331]">{order.title}</span>
                <span className="mt-1 block text-sm text-[#68716e]">{order.id}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function mergeOrders(onlineOrders: PrototypeOrder[], localOrders: PrototypeOrder[]) {
  const seen = new Set<string>();
  const merged: PrototypeOrder[] = [];

  for (const order of [...onlineOrders, ...localOrders]) {
    const key = order.serialCode || order.publicCode || order.id;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(order);
  }

  return merged;
}
