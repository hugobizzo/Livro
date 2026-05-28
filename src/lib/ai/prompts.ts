import type { PrototypeBriefing, PrototypeStoryPage } from "@/lib/prototype-store";

export const STORY_PROMPT_VERSION = 1;
export const STORY_PROMPT_NAME = "livro_story_pages";
export const IMAGE_PROMPT_VERSION = 1;
export const IMAGE_PROMPT_NAME = "livro_page_image";

export function buildStoryPrompt(briefing: PrototypeBriefing) {
  return [
    "Voce e editor senior de livros infantis personalizados em portugues do Brasil.",
    "Crie uma historia infantil completa, curta, afetiva e propria para leitura em voz alta.",
    "Respeite o numero exato de paginas do briefing.",
    "Cada pagina precisa ter cena visual clara, texto curto, emocao principal, elementos obrigatorios e elementos proibidos.",
    "Nao use terror, violencia grafica, conteudo sexual, drogas, odio, armas ou qualquer tema inadequado para criancas.",
    "Nao mencione tecnologia, IA, prompts ou processo interno ao cliente.",
    "Se houver personagem surpresa, nao revele antes da pagina em que a historia preparar essa entrada.",
    "A crianca protagonista deve agir na solucao, nao apenas observar.",
    "Retorne apenas JSON valido no formato solicitado.",
    "",
    "Briefing:",
    JSON.stringify(briefing, null, 2),
  ].join("\n");
}

export function buildImagePrompt({
  title,
  page,
  visualBible,
}: {
  title: string;
  page: PrototypeStoryPage;
  visualBible?: string;
}) {
  return [
    `Crie uma ilustracao vertical para a pagina ${page.pageNumber} do livro infantil "${title}".`,
    "Estilo: livro infantil ilustrado premium, cartoon suave, traco limpo e delicado, cores acolhedoras, luz magica, expressivo e carismatico.",
    "Nao usar fotorealismo. Nao usar 3D. Nao colocar texto, letras, numeros ou baloes dentro da imagem.",
    visualBible ? `Biblia visual oficial: ${visualBible}` : "",
    `Cena: ${page.scene}`,
    `Emocao principal: ${page.emotion}`,
    `Elementos obrigatorios: ${page.requiredElements.join(", ")}`,
    `Elementos proibidos: ${page.forbiddenElements.join(", ")}`,
    "Composicao: deixar area segura inferior para texto aplicado depois em diagramacao.",
  ]
    .filter(Boolean)
    .join("\n");
}

export const storyJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    pages: {
      type: "array",
      minItems: 4,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          pageNumber: { type: "integer", minimum: 1 },
          scene: { type: "string" },
          text: { type: "string" },
          emotion: { type: "string" },
          requiredElements: { type: "array", items: { type: "string" } },
          forbiddenElements: { type: "array", items: { type: "string" } },
        },
        required: ["pageNumber", "scene", "text", "emotion", "requiredElements", "forbiddenElements"],
      },
    },
    qualityNotes: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["pages", "qualityNotes"],
};
