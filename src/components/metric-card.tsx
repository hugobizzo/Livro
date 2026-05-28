import type { Metric } from "@/lib/types";

export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <div className="rounded-2xl border border-[#d9ddd9] bg-white p-5 shadow-sm">
      <p className="text-sm text-[#68716e]">{metric.label}</p>
      <p className="mt-3 text-2xl font-semibold text-[#173331]">{metric.value}</p>
      <p className="mt-2 text-sm text-[#59635f]">{metric.detail}</p>
      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.08em] text-[#0f5f63]">
        {metric.trend}
      </p>
    </div>
  );
}
