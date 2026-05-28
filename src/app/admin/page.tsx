"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Bot, CircleDollarSign, Printer, ShieldCheck } from "lucide-react";
import { MetricCard } from "@/components/metric-card";
import { OrderTable } from "@/components/order-table";
import { StatusPill } from "@/components/status-pill";
import { money } from "@/lib/format";
import { orders, ownerMetrics, printers, qualitySignals } from "@/lib/mock-data";
import { listPrototypeOrders, type PrototypeOrder } from "@/lib/prototype-store";
import type { BookOrder } from "@/lib/types";

export default function AdminPage() {
  const [localOrders, setLocalOrders] = useState<PrototypeOrder[]>([]);
  const visibleOrders = useMemo(
    () => [...localOrders.map(toBookOrder), ...orders],
    [localOrders]
  );
  const totalMargin = visibleOrders.reduce((sum, order) => sum + order.margin, 0);
  const totalGenerationCost = visibleOrders.reduce((sum, order) => sum + order.aiCost, 0);

  useEffect(() => {
    const timer = window.setTimeout(async () => {
      const local = listPrototypeOrders();
      setLocalOrders(local);

      try {
        const response = await fetch("/api/orders");
        if (!response.ok) return;
        const payload = (await response.json()) as { orders?: PrototypeOrder[] };
        setLocalOrders(mergeOrders(payload.orders ?? [], local));
      } catch {
        setLocalOrders(local);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
            Painel do dono
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-[#173331]">
            Operacao enxuta, rastreavel e pronta para escalar.
          </h1>
          <p className="mt-3 max-w-3xl text-[#68716e]">
            Primeira versao funcional com pedidos locais, custos, revisoes, graficas e alertas de qualidade em um unico lugar.
          </p>
        </div>
        <Link
          href="/novo-livro"
          className="inline-flex items-center justify-center rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
        >
          Criar pedido
        </Link>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ownerMetrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold text-[#173331]">Pedidos</h2>
            <span className="text-sm text-[#68716e]">{visibleOrders.length} pedidos na fila</span>
          </div>
          <OrderTable orders={visibleOrders} />
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-[#d9ddd9] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <CircleDollarSign className="size-6 text-[#0f5f63]" aria-hidden="true" />
              <h2 className="font-semibold text-[#173331]">Resumo financeiro</h2>
            </div>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-3">
                <dt className="text-[#68716e]">Margem estimada</dt>
                <dd className="font-semibold text-[#173331]">{money(totalMargin)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#68716e]">Custo geracao</dt>
                <dd className="font-semibold text-[#173331]">{money(totalGenerationCost)}</dd>
              </div>
              <div className="flex justify-between gap-3">
                <dt className="text-[#68716e]">Provider pagamento</dt>
                <dd className="font-semibold text-[#173331]">Mercado Pago</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-2xl border border-[#d9ddd9] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-3">
              <ShieldCheck className="size-6 text-[#146448]" aria-hidden="true" />
              <h2 className="font-semibold text-[#173331]">Qualidade</h2>
            </div>
            <ul className="mt-5 space-y-3 text-sm text-[#59635f]">
              {qualitySignals.map((signal) => (
                <li key={signal} className="rounded-xl bg-[#fbf8f1] p-3">
                  {signal}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Printer className="size-6 text-[#0f5f63]" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-[#173331]">Graficas parceiras</h2>
          </div>
          <div className="mt-5 space-y-4">
            {printers.map((printer) => (
              <div key={printer.id} className="rounded-2xl border border-[#edf0ec] p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-[#173331]">{printer.name}</h3>
                    <p className="mt-1 text-sm text-[#68716e]">{printer.city}</p>
                  </div>
                  <StatusPill value={printer.status === "active" ? "approved" : "waiting"} />
                </div>
                <p className="mt-3 text-sm text-[#59635f]">{printer.formats}</p>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.08em] text-[#0f5f63]">
                  SLA {printer.sla}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <Bot className="size-6 text-[#c77d35]" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-[#173331]">Automacoes e melhoria continua</h2>
          </div>
          <div className="mt-5 space-y-4 text-sm text-[#59635f]">
            <div className="rounded-2xl bg-[#fbf8f1] p-4">
              Automacao de conteudo gera historia, titulo, mensagem emocional e paginas.
            </div>
            <div className="rounded-2xl bg-[#fbf8f1] p-4">
              Automacao de qualidade valida personagens, texto, impressao e LGPD.
            </div>
            <div className="rounded-2xl bg-[#fbf8f1] p-4">
              Mudancas de prompt ficam aguardando aprovacao do dono.
            </div>
            <div className="rounded-2xl border border-[#efb7ad] bg-[#fde7e3] p-4 text-[#9a3f2f]">
              <AlertTriangle className="mb-2 size-5" aria-hidden="true" />
              1 aprendizado pendente: roupas mudaram em revisao minima.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function mergeOrders(onlineOrders: PrototypeOrder[], localOrders: PrototypeOrder[]) {
  const seen = new Set<string>();
  const merged: PrototypeOrder[] = [];

  for (const order of [...onlineOrders, ...localOrders]) {
    const key = `${order.id}:${order.serialCode}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(order);
  }

  return merged;
}

function toBookOrder(order: PrototypeOrder): BookOrder {
  return {
    id: order.id,
    publicCode: order.publicCode,
    serialCode: order.serialCode,
    customer: order.customer,
    childName: order.childName,
    title: order.title,
    city: order.city,
    format: order.format,
    pages: order.pages,
    price: order.price,
    aiCost: order.generationCost,
    printCost: order.printCost,
    freightCost: order.freightCost,
    margin: order.margin,
    financialStatus: order.financialStatus,
    stage: order.stage,
    dueDate: order.dueDate,
    createdAt: order.createdAt,
    approvals: order.approvals,
    timeline: order.timeline,
  };
}
