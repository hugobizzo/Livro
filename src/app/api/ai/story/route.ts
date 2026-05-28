import { NextResponse } from "next/server";
import { estimateTextGenerationCostBrl } from "@/lib/costing";
import type { PrototypeBriefing, PrototypeStoryPage } from "@/lib/prototype-store";
import { createClient } from "@/lib/supabase/server";
import {
  createOpenAIResponse,
  extractOutputText,
  extractUsage,
  getOpenAITextModel,
  isOpenAIConfigured,
} from "@/lib/ai/openai-responses";
import {
  buildStoryPrompt,
  STORY_PROMPT_NAME,
  STORY_PROMPT_VERSION,
  storyJsonSchema,
} from "@/lib/ai/prompts";

type StoryResponse = {
  pages: PrototypeStoryPage[];
  qualityNotes?: string[];
};

export async function POST(request: Request) {
  const body = (await request.json()) as {
    briefing?: PrototypeBriefing;
  };

  if (!body.briefing) {
    return NextResponse.json(
      { ok: false, message: "Briefing ausente." },
      { status: 400 }
    );
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Preparacao completa ainda nao configurada; revise a previa atual.",
      },
      { status: 501 }
    );
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { ok: false, message: "Entre na conta para preparar a historia completa." },
      { status: 401 }
    );
  }

  const model = getOpenAITextModel();

  try {
    const response = await createOpenAIResponse({
      model,
      input: [
        {
          role: "developer",
          content: "Voce escreve livros infantis personalizados com seguranca, consistencia e linguagem afetiva.",
        },
        { role: "user", content: buildStoryPrompt(body.briefing) },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "story_pages",
          strict: true,
          schema: storyJsonSchema,
        },
      },
    });

    const text = extractOutputText(response);
    const parsed = JSON.parse(text) as StoryResponse;
    const usage = extractUsage(response);
    const costBrl = estimateTextGenerationCostBrl(usage.inputTokens, usage.outputTokens);

    await supabase.from("ai_generations").insert({
      kind: "story",
      model,
      prompt_name: STORY_PROMPT_NAME,
      prompt_version: STORY_PROMPT_VERSION,
      status: "completed",
      input_tokens: usage.inputTokens,
      output_tokens: usage.outputTokens,
      cost_brl: costBrl,
      output: parsed,
      created_by: user.id,
    });

    return NextResponse.json({
      ok: true,
      mode: "openai",
      story: parsed.pages,
      qualityNotes: parsed.qualityNotes ?? [],
      costBrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";

    await supabase.from("ai_generations").insert({
      kind: "story",
      model,
      prompt_name: STORY_PROMPT_NAME,
      prompt_version: STORY_PROMPT_VERSION,
      status: "failed",
      error_message: message,
      output: {},
      created_by: user.id,
    });

    return NextResponse.json(
      { ok: false, message: "Nao consegui preparar a historia agora.", error: message },
      { status: 500 }
    );
  }
}
