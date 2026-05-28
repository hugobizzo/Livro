import type { ApprovalStatus, FinancialStatus, OrderStage } from "@/lib/types";

const labels: Record<string, string> = {
  approved: "Aprovado",
  waiting: "Aguardando",
  revision_requested: "Revisao",
  blocked: "Bloqueado",
  draft: "Rascunho",
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  manual_review: "Analise manual",
  briefing: "Briefing",
  story_approval: "Historia",
  character_approval: "Personagens",
  page_approval: "Paginas",
  quality_review: "Qualidade",
  print_package: "Pacote grafica",
  printer_handoff: "Grafica",
};

const tones: Record<string, string> = {
  approved: "bg-[#e5f3ed] text-[#146448] ring-[#b8decd]",
  paid: "bg-[#e5f3ed] text-[#146448] ring-[#b8decd]",
  waiting: "bg-[#fff4dc] text-[#8a5b16] ring-[#f1d394]",
  awaiting_payment: "bg-[#fff4dc] text-[#8a5b16] ring-[#f1d394]",
  revision_requested: "bg-[#fde7e3] text-[#9a3f2f] ring-[#efb7ad]",
  manual_review: "bg-[#fde7e3] text-[#9a3f2f] ring-[#efb7ad]",
  blocked: "bg-[#eef0f2] text-[#596064] ring-[#d8dcde]",
  draft: "bg-[#eef0f2] text-[#596064] ring-[#d8dcde]",
  default: "bg-[#e8f2f4] text-[#245f67] ring-[#c2dce0]",
};

export function StatusPill({
  value,
}: {
  value: ApprovalStatus | FinancialStatus | OrderStage;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
        tones[value] ?? tones.default
      }`}
    >
      {labels[value] ?? value}
    </span>
  );
}
