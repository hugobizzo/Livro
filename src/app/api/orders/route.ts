import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type IncomingCharacter = {
  name?: string;
  role?: string;
  relation?: string;
  personality?: string;
  appearance?: string;
  specialObject?: string;
  catchphrase?: string;
  notes?: string;
};

type IncomingStoryPage = {
  pageNumber: number;
  scene: string;
  text: string;
  emotion?: string;
  requiredElements?: string[];
  forbiddenElements?: string[];
};

type IncomingApproval = {
  label: string;
  status: string;
  revisionsUsed: number;
  revisionsLimit: number;
};

type IncomingOrder = {
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
  financialStatus: string;
  stage: string;
  statusLabel: string;
  dueDate?: string;
  briefing: {
    characters?: IncomingCharacter[];
  } & Record<string, unknown>;
  story: IncomingStoryPage[];
  approvals: IncomingApproval[];
};

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { ok: false, message: "Login necessario para salvar online." },
      { status: 401 }
    );
  }

  const order = (await request.json()) as IncomingOrder;
  const dueDate = parseBrazilianDate(order.dueDate);

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .insert({
      owner_user_id: user.id,
      public_code: order.publicCode,
      serial_code: order.serialCode,
      customer_name: order.customer,
      child_name: order.childName,
      title: order.title,
      city: order.city,
      format: order.format,
      pages: order.pages,
      price_brl: order.price,
      generation_cost_brl: order.generationCost,
      print_cost_brl: order.printCost,
      freight_cost_brl: order.freightCost,
      financial_status: order.financialStatus,
      stage: order.stage,
      status_label: order.statusLabel,
      briefing: order.briefing,
      due_date: dueDate,
    })
    .select("id")
    .single();

  if (orderError || !orderRow) {
    return NextResponse.json(
      { ok: false, message: "Nao consegui criar o pedido.", error: orderError?.message },
      { status: 500 }
    );
  }

  const orderId = orderRow.id as string;
  const characters = order.briefing.characters ?? [];

  if (characters.length > 0) {
    const { error } = await supabase.from("order_characters").insert(
      characters.map((character, index) => ({
        order_id: orderId,
        name: character.name || `Personagem ${index + 1}`,
        role: character.role || "Personagem",
        relation: character.relation,
        personality: character.personality,
        appearance: character.appearance,
        special_object: character.specialObject,
        catchphrase: character.catchphrase,
        immutable_notes: character.notes,
        sort_order: index,
      }))
    );

    if (error) return persistError(error.message);
  }

  if (order.story.length > 0) {
    const { error } = await supabase.from("story_pages").insert(
      order.story.map((page) => ({
        order_id: orderId,
        page_number: page.pageNumber,
        scene: page.scene,
        page_text: page.text,
        emotion: page.emotion,
        required_elements: page.requiredElements ?? [],
        forbidden_elements: page.forbiddenElements ?? [],
      }))
    );

    if (error) return persistError(error.message);
  }

  if (order.approvals.length > 0) {
    const { error } = await supabase.from("approvals").insert(
      order.approvals.map((approval) => ({
        order_id: orderId,
        label: approval.label,
        status: approval.status,
        revisions_used: approval.revisionsUsed,
        revisions_limit: approval.revisionsLimit,
      }))
    );

    if (error) return persistError(error.message);
  }

  return NextResponse.json({ ok: true, orderId });
}

function persistError(message: string) {
  return NextResponse.json(
    { ok: false, message: "Pedido parcialmente criado; erro em dados relacionados.", error: message },
    { status: 500 }
  );
}

function parseBrazilianDate(value?: string) {
  if (!value) return null;
  const [day, month, year] = value.split("/");
  if (!day || !month || !year) return null;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}
