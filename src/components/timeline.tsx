import { CheckCircle2, Circle, Clock3 } from "lucide-react";
import type { TimelineItem } from "@/lib/types";

const icons = {
  done: CheckCircle2,
  current: Clock3,
  next: Circle,
};

export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="space-y-4">
      {items.map((item) => {
        const Icon = icons[item.status];
        return (
          <li key={item.label} className="flex gap-3">
            <span
              className={`mt-1 flex size-8 shrink-0 items-center justify-center rounded-full ${
                item.status === "done"
                  ? "bg-[#e5f3ed] text-[#146448]"
                  : item.status === "current"
                    ? "bg-[#fff4dc] text-[#8a5b16]"
                    : "bg-[#eef0f2] text-[#68716e]"
              }`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-semibold text-[#173331]">{item.label}</span>
              <span className="block text-sm text-[#68716e]">{item.description}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
