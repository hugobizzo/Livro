import type { ApprovalItem, FinancialStatus, OrderStage, TimelineItem } from "@/lib/types";
import type { PrototypeOrder, PrototypeStoryPage } from "@/lib/prototype-store";

export type OrderRow = {
  id: string;
  public_code: string;
  serial_code: string;
  customer_name: string | null;
  child_name: string;
  title: string;
  city: string | null;
  format: string;
  pages: number;
  price_brl: number | string;
  generation_cost_brl: number | string;
  print_cost_brl: number | string;
  freight_cost_brl: number | string;
  margin_brl: number | string;
  financial_status: FinancialStatus;
  stage: OrderStage;
  status_label: string;
  briefing: PrototypeOrder["briefing"];
  due_date: string | null;
  created_at: string;
  story_pages?: Array<{
    page_number: number;
    scene: string;
    page_text: string;
    emotion: string | null;
    required_elements: string[] | null;
    forbidden_elements: string[] | null;
  }>;
  approvals?: Array<{
    label: string;
    status: ApprovalItem["status"];
    revisions_used: number;
    revisions_limit: number;
  }>;
};

export function mapOrderRow(row: OrderRow): PrototypeOrder {
  const story: PrototypeStoryPage[] = [...(row.story_pages ?? [])]
    .sort((a, b) => a.page_number - b.page_number)
    .map((page) => ({
      pageNumber: page.page_number,
      scene: page.scene,
      text: page.page_text,
      emotion: page.emotion ?? "",
      requiredElements: page.required_elements ?? [],
      forbiddenElements: page.forbidden_elements ?? [],
    }));

  const approvals: ApprovalItem[] = (row.approvals ?? []).map((approval) => ({
    label: approval.label,
    status: approval.status,
    revisionsUsed: approval.revisions_used,
    revisionsLimit: approval.revisions_limit,
  }));

  return {
    id: row.serial_code,
    publicCode: row.public_code,
    serialCode: row.serial_code,
    customer: row.customer_name ?? "Cliente",
    childName: row.child_name,
    title: row.title,
    city: row.city ?? "Cidade a definir",
    format: row.format,
    pages: row.pages,
    price: Number(row.price_brl),
    generationCost: Number(row.generation_cost_brl),
    printCost: Number(row.print_cost_brl),
    freightCost: Number(row.freight_cost_brl),
    margin: Number(row.margin_brl),
    financialStatus: row.financial_status,
    stage: row.stage,
    statusLabel: row.status_label,
    dueDate: row.due_date ? new Date(`${row.due_date}T00:00:00`).toLocaleDateString("pt-BR") : "",
    createdAt: new Date(row.created_at).toLocaleDateString("pt-BR"),
    briefing: row.briefing,
    story,
    approvals,
    timeline: timelineFor(row.stage, row.status_label),
    supportNotes: [],
  };
}

function timelineFor(stage: OrderStage, statusLabel: string): TimelineItem[] {
  if (stage === "briefing") {
    return [
      { label: "Briefing", description: statusLabel, status: "current" },
      { label: "Historia", description: "Gerar e aprovar historia.", status: "next" },
    ];
  }

  if (stage === "character_approval") {
    return [
      { label: "Historia aprovada", description: "Texto congelado para producao.", status: "done" },
      { label: "Personagens", description: statusLabel, status: "current" },
      { label: "Paginas", description: "Gerar paginas apos guia visual.", status: "next" },
    ];
  }

  return [
    { label: "Pedido criado", description: "Briefing e pagamento registrados.", status: "done" },
    { label: "Etapa atual", description: statusLabel, status: "current" },
    { label: "Producao", description: "Proximas etapas do livro.", status: "next" },
  ];
}
