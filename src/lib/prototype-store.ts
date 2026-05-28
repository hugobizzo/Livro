"use client";

import type { ApprovalItem, FinancialStatus, OrderStage, TimelineItem } from "./types";

const ORDERS_KEY = "livro-magico:orders:v1";

export type PrototypeCharacter = {
  id: string;
  name: string;
  role: string;
  relation: string;
  personality: string;
  appearance: string;
  catchphrase: string;
  specialObject: string;
  hasPhoto: boolean;
  photoName?: string;
  photoPreview?: string;
  skinTone: string;
  hair: string;
  eyes: string;
  notes: string;
};

export type PrototypeBriefing = {
  idea: string;
  theme: string;
  emotionalMessage: string;
  title: string;
  childName: string;
  targetAge: string;
  tone: string;
  dedication: string;
  dedicationPlace: string;
  format: string;
  pages: number;
  characters: PrototypeCharacter[];
};

export type PrototypeStoryPage = {
  pageNumber: number;
  scene: string;
  text: string;
  emotion: string;
  requiredElements: string[];
  forbiddenElements: string[];
};

export type PrototypeOrder = {
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
  generationCost: number;
  printCost: number;
  freightCost: number;
  margin: number;
  financialStatus: FinancialStatus;
  stage: OrderStage;
  statusLabel: string;
  dueDate: string;
  createdAt: string;
  briefing: PrototypeBriefing;
  story: PrototypeStoryPage[];
  approvals: ApprovalItem[];
  timeline: TimelineItem[];
  supportNotes: string[];
};

type CreateOrderOptions = {
  draft?: boolean;
};

export function emptyCharacter(role = "Protagonista", name = ""): PrototypeCharacter {
  return {
    id: crypto.randomUUID(),
    name,
    role,
    relation: role.toLowerCase().includes("protagon") ? "propria crianca" : "",
    personality: "",
    appearance: "",
    catchphrase: "",
    specialObject: "",
    hasPhoto: true,
    skinTone: "",
    hair: "",
    eyes: "",
    notes: "",
  };
}

export function defaultBriefing(): PrototypeBriefing {
  return {
    idea: "",
    theme: "",
    emotionalMessage: "",
    title: "",
    childName: "",
    targetAge: "2 a 6 anos",
    tone: "magico, afetivo e aventureiro",
    dedication: "",
    dedicationPlace: "primeira pagina",
    format: "A5 vertical",
    pages: 16,
    characters: [emptyCharacter("Protagonista")],
  };
}

export function listPrototypeOrders(): PrototypeOrder[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = window.localStorage.getItem(ORDERS_KEY);
    return raw ? (JSON.parse(raw) as PrototypeOrder[]) : [];
  } catch {
    return [];
  }
}

export function getPrototypeOrder(id: string): PrototypeOrder | undefined {
  return listPrototypeOrders().find((order) => order.id === id);
}

export function savePrototypeOrder(order: PrototypeOrder) {
  const current = listPrototypeOrders().filter((existing) => existing.id !== order.id);
  window.localStorage.setItem(ORDERS_KEY, JSON.stringify([order, ...current]));
}

export function updatePrototypeOrder(order: PrototypeOrder) {
  savePrototypeOrder(order);
}

export function createPrototypeOrder(
  briefing: PrototypeBriefing,
  options: CreateOrderOptions = {}
): PrototypeOrder {
  const now = new Date();
  const suffix = Math.floor(100000 + Math.random() * 899999).toString();
  const year = now.getFullYear();
  const title = clean(briefing.title) || suggestedTitle(briefing);
  const childName = clean(briefing.childName) || firstCharacterName(briefing) || "Crianca";
  const financialStatus: FinancialStatus = options.draft ? "draft" : "paid";
  const stage: OrderStage = options.draft ? "briefing" : "story_approval";
  const story = generateStoryPages({ ...briefing, title, childName });

  return {
    id: `LM-${suffix}`,
    publicCode: `magico-${crypto.randomUUID().slice(0, 8)}`,
    serialCode: `LM-${year}-${suffix}`,
    customer: "Cliente local",
    childName,
    title,
    city: "Cidade a definir",
    format: briefing.format,
    pages: briefing.pages,
    price: 200,
    generationCost: 0,
    printCost: 70,
    freightCost: 25,
    margin: 105,
    financialStatus,
    stage,
    statusLabel: options.draft
      ? "Rascunho salvo; briefing ainda pode ser ajustado"
      : "Pagamento registrado; historia aguardando aprovacao",
    dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("pt-BR"),
    createdAt: now.toLocaleDateString("pt-BR"),
    briefing: {
      ...briefing,
      title,
      childName,
    },
    story,
    approvals: [
      { label: "Historia", status: options.draft ? "blocked" : "waiting", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Personagens", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Paginas", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Capa", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
      { label: "Prova final", status: "blocked", revisionsUsed: 0, revisionsLimit: 2 },
    ],
    timeline: options.draft
      ? [
          {
            label: "Rascunho salvo",
            description: "Ideia inicial registrada para continuar depois.",
            status: "current",
          },
          {
            label: "Pagamento",
            description: "Etapa futura antes da producao completa.",
            status: "next",
          },
        ]
      : [
          {
            label: "Briefing salvo",
            description: "Ideia, personagens e dedicacao foram registrados.",
            status: "done",
          },
          {
            label: "Historia para aprovacao",
            description: "Revise texto, cenas e mensagem antes de seguir.",
            status: "current",
          },
          {
            label: "Personagens",
            description: "Depois da historia, cada personagem recebe guia visual proprio.",
            status: "next",
          },
        ],
    supportNotes: [],
  };
}

export function approveStory(order: PrototypeOrder): PrototypeOrder {
  return {
    ...order,
    stage: "character_approval",
    statusLabel: "Historia aprovada; aguardando personagens",
    approvals: order.approvals.map((approval) =>
      approval.label === "Historia"
        ? { ...approval, status: "approved" }
        : approval.label === "Personagens"
          ? { ...approval, status: "waiting" }
          : approval
    ),
    timeline: [
      { label: "Historia aprovada", description: "Texto congelado para as proximas etapas.", status: "done" },
      { label: "Guia visual dos personagens", description: "Cada personagem sera aprovado separadamente.", status: "current" },
      { label: "Paginas ilustradas", description: "Gerar somente apos personagens aprovados.", status: "next" },
    ],
  };
}

export function requestStoryRevision(order: PrototypeOrder, note: string): PrototypeOrder {
  const approvals = order.approvals.map((approval) => {
    if (approval.label !== "Historia") return approval;
    const revisionsUsed = Math.min(approval.revisionsUsed + 1, approval.revisionsLimit);
    const status: ApprovalItem["status"] =
      revisionsUsed >= approval.revisionsLimit ? "blocked" : "revision_requested";

    return {
      ...approval,
      status,
      revisionsUsed,
    };
  });

  return {
    ...order,
    statusLabel: "Revisao de historia solicitada",
    approvals,
    supportNotes: [clean(note) || "Revisao solicitada pelo cliente.", ...order.supportNotes],
  };
}

export function addSupportNote(order: PrototypeOrder, note: string): PrototypeOrder {
  return {
    ...order,
    supportNotes: [clean(note) || "Cliente pediu contato do suporte.", ...order.supportNotes],
  };
}

export function replaceStory(order: PrototypeOrder, story: PrototypeStoryPage[]): PrototypeOrder {
  return {
    ...order,
    story,
    statusLabel: order.stage === "story_approval" ? "Historia ajustada; aguardando aprovacao" : order.statusLabel,
  };
}

export function suggestedTitle(briefing: PrototypeBriefing) {
  const child = clean(briefing.childName) || firstCharacterName(briefing) || "Meu Pequeno Livro";
  const theme = clean(briefing.theme) || themeFromIdea(briefing.idea) || "uma aventura especial";
  return `${child} e ${shortTheme(theme)}`;
}

export function themeFromIdea(idea: string) {
  const text = clean(idea);
  if (!text) return "";

  const lower = text.toLowerCase();
  if (lower.includes("astronaut") || lower.includes("espaco") || lower.includes("foguete")) {
    return "uma aventura pelo espaco";
  }
  if (lower.includes("dinoss")) return "uma aventura no vale dos dinossauros";
  if (lower.includes("mar") || lower.includes("oceano") || lower.includes("peixe")) {
    return "uma aventura no fundo do mar";
  }
  if (lower.includes("escola")) return "o primeiro dia de escola";
  if (lower.includes("sono") || lower.includes("dormir")) return "uma noite tranquila e cheia de carinho";

  return text.length > 92 ? `${text.slice(0, 89).trim()}...` : text;
}

export function messageFromIdea(idea: string) {
  const lower = idea.toLowerCase();
  if (lower.includes("famil") || lower.includes("casa") || lower.includes("lar")) {
    return "lar e onde a familia esta";
  }
  if (lower.includes("medo") || lower.includes("coragem")) {
    return "coragem tambem e pedir ajuda";
  }
  if (lower.includes("irma") || lower.includes("dividir")) {
    return "quando dividimos uma aventura, ela fica maior";
  }
  if (lower.includes("sono") || lower.includes("dormir")) {
    return "a noite pode ser segura quando o amor esta por perto";
  }

  return "o amor acompanha cada descoberta";
}

function firstCharacterName(briefing: PrototypeBriefing) {
  return briefing.characters.find((character) => clean(character.name))?.name.trim();
}

function protagonist(briefing: PrototypeBriefing) {
  return briefing.characters.find((character) =>
    character.role.toLowerCase().includes("protagon")
  ) ?? briefing.characters[0];
}

function supportingCharacters(briefing: PrototypeBriefing) {
  const hero = protagonist(briefing);
  return briefing.characters.filter((character) => character.id !== hero?.id && clean(character.name));
}

export function generateStoryPages(briefing: PrototypeBriefing): PrototypeStoryPage[] {
  const hero = protagonist(briefing);
  const heroName = clean(briefing.childName) || clean(hero?.name ?? "") || "a crianca";
  const theme = clean(briefing.theme) || themeFromIdea(briefing.idea) || "uma aventura cheia de descobertas";
  const message = clean(briefing.emotionalMessage) || messageFromIdea(briefing.idea);
  const specialObject = clean(hero?.specialObject ?? "") || "um pequeno objeto querido";
  const supporters = supportingCharacters(briefing).map((character) => clean(character.name));
  const supporterText = supporters.length ? naturalList(supporters) : "as pessoas que ama";
  const title = clean(briefing.title) || suggestedTitle(briefing);
  const tone = clean(briefing.tone) || "magico e afetivo";

  const pages = [
    {
      scene: `${heroName} em casa, percebendo um sinal ligado a ${theme}.`,
      text: `${heroName} encontrou um brilho diferente perto de ${specialObject}. Parecia o comeco de uma aventura feita so para abrir o coracao.`,
      emotion: "curiosidade",
    },
    {
      scene: `O chamado da aventura aparece de forma delicada, sem assustar.`,
      text: `O brilho apontava para ${theme}. ${heroName} respirou fundo e sentiu que podia dar o primeiro passo.`,
      emotion: "encanto",
    },
    {
      scene: `${heroName} cruza a entrada do mundo da historia.`,
      text: `De repente, tudo ficou mais colorido. O caminho parecia novo, mas o coracao de ${heroName} sabia escutar.`,
      emotion: "descoberta",
    },
    {
      scene: `O mundo principal do livro se revela com clima ${tone}.`,
      text: `Havia sons macios, luzes pequenas e pistas escondidas por todos os lados. Cada detalhe parecia dizer: continue.`,
      emotion: "maravilha",
    },
    {
      scene: `Uma lembranca de ${supporterText} aparece como apoio afetivo.`,
      text: `${heroName} pensou em ${supporterText}. So de lembrar, o caminho ficou um pouquinho mais claro.`,
      emotion: "carinho",
    },
    {
      scene: `Um desafio leve interrompe a caminhada.`,
      text: `Entao apareceu um problema no meio da aventura. Nao era grande demais, mas era grande o bastante para pedir coragem.`,
      emotion: "medo leve",
    },
    {
      scene: `${heroName} observa o desafio e tenta entender o que ele precisa.`,
      text: `${heroName} chegou mais perto com cuidado. As vezes, antes de vencer um medo, a gente precisa olhar para ele com carinho.`,
      emotion: "coragem",
    },
    {
      scene: `${specialObject} ajuda ${heroName} a lembrar da mensagem do livro.`,
      text: `${specialObject} ficou quentinho na mao de ${heroName}. Foi ali que a lembranca apareceu: ${message}.`,
      emotion: "confianca",
    },
    {
      scene: `O desafio muda de significado e ganha ternura.`,
      text: `O que parecia dificil comecou a ficar menor. Talvez a aventura nao quisesse assustar; talvez so quisesse ser entendida.`,
      emotion: "alivio",
    },
    {
      scene: `${heroName} encontra uma pista importante para seguir.`,
      text: `Com um sorriso pequeno, ${heroName} encontrou a pista que faltava. Ela brilhava do jeito das coisas que a gente quase esquece de ver.`,
      emotion: "foco",
    },
    {
      scene: `Momento central da historia, com decisao gentil do protagonista.`,
      text: `${heroName} escolheu ajudar em vez de correr. E, quando escolheu com carinho, o caminho inteiro se abriu.`,
      emotion: "emocao",
    },
    {
      scene: `Celebracao visual no mundo da aventura.`,
      text: `As cores dancaram ao redor. Tudo parecia agradecer, como se a historia tivesse guardado aquela festa para ${heroName}.`,
      emotion: "alegria",
    },
    {
      scene: `O retorno comeca, mantendo o clima seguro e acolhedor.`,
      text: `Era hora de voltar. ${heroName} levou a descoberta no peito e percebeu que voltar tambem podia ser parte da magia.`,
      emotion: "seguranca",
    },
    {
      scene: `A mensagem emocional fica clara em uma cena simples.`,
      text: `Perto do fim do caminho, ${heroName} entendeu devagarinho: ${message}. E essa era uma descoberta maior que qualquer mapa.`,
      emotion: "ternura",
    },
    {
      scene: `${supporterText} se conecta ao aprendizado final.`,
      text: `Quando pensou em ${supporterText}, ${heroName} sorriu. Algumas aventuras terminam com chegada; outras terminam com abraco.`,
      emotion: "amor",
    },
    {
      scene: `Fechamento calmo, pronto para a ultima imagem do livro.`,
      text: `Naquela noite, ${heroName} guardou ${title} dentro da memoria. E dormiu sabendo que uma historia bonita pode morar pertinho da gente.`,
      emotion: "calma",
    },
  ];

  return pages.map((page, index) => ({
    pageNumber: index + 1,
    scene: page.scene,
    text: page.text,
    emotion: page.emotion,
    requiredElements: [
      heroName,
      index < 13 ? specialObject : "clima de volta para casa",
      index === 0 ? "nao revelar surpresas cedo demais" : theme,
    ],
    forbiddenElements:
      index === 0
        ? ["nao revelar personagem surpresa antes da hora", "nao usar fotorealismo"]
        : ["nao usar fotorealismo", "nao usar estilo 3D"],
  }));
}

function clean(value: string | undefined) {
  return (value ?? "").trim();
}

function shortTheme(theme: string) {
  const normalized = theme
    .replace(/^uma?\s+/i, "")
    .replace(/^o\s+/i, "")
    .replace(/^a\s+/i, "")
    .trim();

  if (normalized.length <= 42) return normalized;
  return `${normalized.slice(0, 39).trim()}...`;
}

function naturalList(items: string[]) {
  if (items.length <= 1) return items[0] ?? "";
  if (items.length === 2) return `${items[0]} e ${items[1]}`;

  const start = items.slice(0, -1).join(", ");
  return `${start} e ${items[items.length - 1]}`;
}
