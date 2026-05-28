import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { money } from "@/lib/format";
import type { BookOrder } from "@/lib/types";
import { StatusPill } from "./status-pill";

export function OrderTable({ orders }: { orders: BookOrder[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9ddd9] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-[#f0ebe0] text-xs uppercase tracking-[0.08em] text-[#5f625f]">
            <tr>
              <th className="px-5 py-4">Pedido</th>
              <th className="px-5 py-4">Cliente</th>
              <th className="px-5 py-4">Livro</th>
              <th className="px-5 py-4">Etapa</th>
              <th className="px-5 py-4">Pagamento</th>
              <th className="px-5 py-4">Margem</th>
              <th className="px-5 py-4">Prazo</th>
              <th className="px-5 py-4" aria-label="Abrir pedido" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[#edf0ec]">
            {orders.map((order) => (
              <tr key={order.id} className="align-middle">
                <td className="px-5 py-4 font-semibold text-[#173331]">{order.id}</td>
                <td className="px-5 py-4 text-[#40504c]">
                  {order.customer}
                  <span className="block text-xs text-[#7a817e]">{order.city}</span>
                </td>
                <td className="px-5 py-4 text-[#40504c]">
                  {order.title}
                  <span className="block text-xs text-[#7a817e]">
                    {order.pages} paginas · {order.format}
                  </span>
                </td>
                <td className="px-5 py-4">
                  <StatusPill value={order.stage} />
                </td>
                <td className="px-5 py-4">
                  <StatusPill value={order.financialStatus} />
                </td>
                <td className="px-5 py-4 font-semibold text-[#173331]">{money(order.margin)}</td>
                <td className="px-5 py-4 text-[#40504c]">{order.dueDate}</td>
                <td className="px-5 py-4">
                  <Link
                    href={`/admin/pedidos/${order.id}`}
                    className="inline-flex size-9 items-center justify-center rounded-xl border border-[#d9ddd9] text-[#0f5f63] transition hover:bg-[#e8f2f4]"
                    aria-label={`Abrir pedido ${order.id}`}
                  >
                    <ArrowRight className="size-4" aria-hidden="true" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
