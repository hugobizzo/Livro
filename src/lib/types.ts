export type OrderStage =
  | "briefing"
  | "story_approval"
  | "character_approval"
  | "page_approval"
  | "quality_review"
  | "print_package"
  | "printer_handoff";

export type FinancialStatus = "draft" | "awaiting_payment" | "paid" | "manual_review";

export type ApprovalStatus = "approved" | "waiting" | "revision_requested" | "blocked";

export type Metric = {
  label: string;
  value: string;
  detail: string;
  trend: string;
};

export type ApprovalItem = {
  label: string;
  status: ApprovalStatus;
  revisionsUsed: number;
  revisionsLimit: number;
};

export type TimelineItem = {
  label: string;
  description: string;
  status: "done" | "current" | "next";
};

export type BookOrder = {
  id: string;
  publicCode: string;
  serialCode: string;
  customer: string;
  childName: string;
  title: string;
  city: string;
  format: string;
  pages: number;
  price: number;
  aiCost: number;
  printCost: number;
  freightCost: number;
  margin: number;
  financialStatus: FinancialStatus;
  stage: OrderStage;
  dueDate: string;
  createdAt: string;
  approvals: ApprovalItem[];
  timeline: TimelineItem[];
};

export type Printer = {
  id: string;
  name: string;
  city: string;
  status: "active" | "testing" | "paused";
  formats: string;
  sla: string;
};
