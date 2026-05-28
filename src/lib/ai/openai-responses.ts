import { optionalServerEnv } from "@/lib/server/env";

type OpenAIUsage = {
  input_tokens?: number;
  output_tokens?: number;
};

export type OpenAIResponsePayload = Record<string, unknown> & {
  output_text?: string;
  output?: unknown[];
  usage?: OpenAIUsage;
};

export function getOpenAITextModel() {
  return optionalServerEnv("OPENAI_TEXT_MODEL") || "gpt-5.5";
}

export function getOpenAIImageModel() {
  return optionalServerEnv("OPENAI_IMAGE_MODEL") || "gpt-image-1.5";
}

export function isOpenAIConfigured() {
  return Boolean(optionalServerEnv("OPENAI_API_KEY"));
}

export async function createOpenAIResponse(payload: Record<string, unknown>) {
  const apiKey = optionalServerEnv("OPENAI_API_KEY");

  if (!apiKey) {
    throw new Error("OPENAI_API_KEY nao configurada.");
  }

  const response = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as OpenAIResponsePayload & { error?: { message?: string } };

  if (!response.ok) {
    throw new Error(data.error?.message || "Erro ao chamar OpenAI Responses API.");
  }

  return data;
}

export function extractOutputText(response: OpenAIResponsePayload) {
  if (typeof response.output_text === "string") return response.output_text;

  for (const item of response.output ?? []) {
    if (!isRecord(item)) continue;
    const content = item.content;
    if (!Array.isArray(content)) continue;
    for (const part of content) {
      if (isRecord(part) && typeof part.text === "string") return part.text;
    }
  }

  return "";
}

export function extractFirstImageBase64(response: OpenAIResponsePayload) {
  for (const item of response.output ?? []) {
    if (!isRecord(item)) continue;
    if (item.type === "image_generation_call" && typeof item.result === "string") {
      return item.result;
    }
  }

  return "";
}

export function extractUsage(response: OpenAIResponsePayload) {
  return {
    inputTokens: response.usage?.input_tokens ?? 0,
    outputTokens: response.usage?.output_tokens ?? 0,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
