import type { BookOrder, Metric, Printer } from "./types";

export const ownerMetrics: Metric[] = [
  {
    label: "Pedidos pagos",
    value: "18",
    detail: "6 em producao, 4 aguardando cliente",
    trend: "+22% na semana",
  },
  {
    label: "Receita estimada",
    value: "R$ 3.600",
    detail: "Ticket inicial de R$ 200",
    trend: "Base MVP",
  },
  {
    label: "Margem estimada",
    value: "R$ 910",
    detail: "Apos geracao, grafica e frete estimados",
    trend: "25,3%",
  },
  {
    label: "Custo geracao",
    value: "R$ 126",
    detail: "Media de R$ 7,00 por pedido",
    trend: "Monitorar",
  },
];

export const orders: BookOrder[] = [
  {
    id: "LM-000124",
    publicCode: "magico-7K4Q2",
    serialCode: "LM-2026-000124",
    customer: "Mariana Rocha",
    childName: "Lia",
    title: "Lia e o Jardim das Estrelas",
    city: "Sao Paulo, SP",
    format: "A5 vertical",
    pages: 16,
    price: 200,
    aiCost: 8,
    printCost: 72,
    freightCost: 24,
    margin: 96,
    financialStatus: "paid",
    stage: "story_approval",
    dueDate: "30/05/2026",
    createdAt: "27/05/2026",
    approvals: [
      { label: "Historia", status: "waiting", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Personagens", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Paginas", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Capa", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Prova final", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
    ],
    timeline: [
      {
        label: "Pagamento confirmado",
        description: "Pedido liberado para producao.",
        status: "done",
      },
      {
        label: "Historia para aprovacao",
        description: "Cliente revisa texto pagina a pagina.",
        status: "current",
      },
      {
        label: "Guia visual",
        description: "Personagens serao ilustrados sem fotorealismo.",
        status: "next",
      },
    ],
  },
  {
    id: "LM-000123",
    publicCode: "magico-9P8A1",
    serialCode: "LM-2026-000123",
    customer: "Rafael Martins",
    childName: "Theo",
    title: "Theo no Planeta dos Abracos",
    city: "Brasilia, DF",
    format: "A5 vertical",
    pages: 16,
    price: 200,
    aiCost: 11,
    printCost: 68,
    freightCost: 28,
    margin: 93,
    financialStatus: "paid",
    stage: "page_approval",
    dueDate: "29/05/2026",
    createdAt: "26/05/2026",
    approvals: [
      { label: "Historia", status: "approved", revisionsUsed: 1, revisionsLimit: 2 },
      { label: "Personagens", status: "approved", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Paginas", status: "revision_requested", revisionsUsed: 1, revisionsLimit: 2 },
      { label: "Capa", status: "waiting", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Prova final", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
    ],
    timeline: [
      {
        label: "Historia aprovada",
        description: "Texto congelado para diagramacao.",
        status: "done",
      },
      {
        label: "Paginas em revisao",
        description: "Pagina 7 pediu correcao de roupa.",
        status: "current",
      },
      {
        label: "Capa e contracapa",
        description: "Gerar apos paginas internas aprovadas.",
        status: "next",
      },
    ],
  },
  {
    id: "LM-000122",
    publicCode: "magico-5T1B8",
    serialCode: "LM-2026-000122",
    customer: "Ana Beatriz Lima",
    childName: "Nina",
    title: "Nina e o Barquinho Corajoso",
    city: "Rio de Janeiro, RJ",
    format: "A5 vertical",
    pages: 16,
    price: 200,
    aiCost: 6,
    printCost: 70,
    freightCost: 22,
    margin: 102,
    financialStatus: "paid",
    stage: "print_package",
    dueDate: "28/05/2026",
    createdAt: "25/05/2026",
    approvals: [
      { label: "Historia", status: "approved", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Personagens", status: "approved", revisionsUsed: 1, revisionsLimit: 2 },
      { label: "Paginas", status: "approved", revisionsUsed: 2, revisionsLimit: 2 },
      { label: "Capa", status: "approved", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Prova final", status: "waiting", revisionsUsed: 0, revisionsLimit: 2 },
    ],
    timeline: [
      {
        label: "Livro diagramado",
        description: "PDF de prova criado com QR e serial.",
        status: "done",
      },
      {
        label: "Revisao final admin",
        description: "Checar imposicao A5 e pacote para grafica.",
        status: "current",
      },
      {
        label: "Enviar para grafica",
        description: "Pacote ZIP sera enviado manualmente.",
        status: "next",
      },
    ],
  },
];

export const printers: Printer[] = [
  {
    id: "grafica-sp-01",
    name: "Grafica Parceira SP",
    city: "Sao Paulo, SP",
    status: "testing",
    formats: "A5, A4, grampo canoa",
    sla: "3 dias uteis",
  },
  {
    id: "grafica-rj-01",
    name: "Atelie Grafico RJ",
    city: "Rio de Janeiro, RJ",
    status: "active",
    formats: "A5, capa couchê, lombada futura",
    sla: "4 dias uteis",
  },
  {
    id: "grafica-df-01",
    name: "Print Sob Demanda DF",
    city: "Brasilia, DF",
    status: "testing",
    formats: "A5, A4",
    sla: "5 dias uteis",
  },
];

export const qualitySignals = [
  "2 pedidos acima do limite de revisao aguardam analise manual.",
  "Nenhuma foto original passou do prazo de retencao de 30 dias.",
  "Pagina 7 concentrou 3 pedidos de correcao de roupa nesta semana.",
  "Custo medio de geracao abaixo do limite operacional planejado.",
];

export function getOrder(id: string) {
  return orders.find((order) => order.id === id);
}

export function getOrderByPublicCode(code: string) {
  return orders.find((order) => order.publicCode === code);
}
