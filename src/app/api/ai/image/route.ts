import { NextResponse } from "next/server";
import { estimateImageGenerationCostBrl } from "@/lib/costing";
import type { PrototypeStoryPage } from "@/lib/prototype-store";
import {
  buildImagePrompt,
  IMAGE_PROMPT_NAME,
  IMAGE_PROMPT_VERSION,
} from "@/lib/ai/prompts";
import {
  createOpenAIResponse,
  extractFirstImageBase64,
  getOpenAIImageModel,
  getOpenAITextModel,
  isOpenAIConfigured,
} from "@/lib/ai/openai-responses";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    title?: string;
    page?: PrototypeStoryPage;
    visualBible?: string;
  };

  if (!body.title || !body.page) {
    return NextResponse.json(
      { ok: false, message: "Titulo e pagina sao obrigatorios." },
      { status: 400 }
    );
  }

  if (!isOpenAIConfigured()) {
    return NextResponse.json(
      { ok: false, configured: false, message: "OPENAI_API_KEY ainda nao configurada." },
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
      { ok: false, message: "Entre na conta para preparar imagens." },
      { status: 401 }
    );
  }

  const imageModel = getOpenAIImageModel();
  const prompt = buildImagePrompt({
    title: body.title,
    page: body.page,
    visualBible: body.visualBible,
  });

  try {
    const response = await createOpenAIResponse({
      model: getOpenAITextModel(),
      input: prompt,
      tools: [
        {
          type: "image_generation",
          model: imageModel,
          size: "1024x1536",
          quality: "medium",
        },
      ],
    });

    const imageBase64 = extractFirstImageBase64(response);

    if (!imageBase64) {
      throw new Error("Resposta sem imagem.");
    }

    const costBrl = estimateImageGenerationCostBrl(1);

    await supabase.from("ai_generations").insert({
      kind: `page_image_${body.page.pageNumber}`,
      model: imageModel,
      prompt_name: IMAGE_PROMPT_NAME,
      prompt_version: IMAGE_PROMPT_VERSION,
      status: "completed",
      image_count: 1,
      cost_brl: costBrl,
      output: { pageNumber: body.page.pageNumber, prompt },
      created_by: user.id,
    });

    return NextResponse.json({
      ok: true,
      image: `data:image/png;base64,${imageBase64}`,
      prompt,
      costBrl,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";

    await supabase.from("ai_generations").insert({
      kind: `page_image_${body.page.pageNumber}`,
      model: imageModel,
      prompt_name: IMAGE_PROMPT_NAME,
      prompt_version: IMAGE_PROMPT_VERSION,
      status: "failed",
      error_message: message,
      output: { prompt },
      created_by: user.id,
    });

    return NextResponse.json(
      { ok: false, message: "Nao consegui preparar a imagem agora.", error: message },
      { status: 500 }
    );
  }
}
