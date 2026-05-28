import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { mapOrderRow, type OrderRow } from "@/lib/supabase/order-mapping";
import type { PrototypeOrder } from "@/lib/prototype-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ ok: false, authenticated: false, order: null });
  }

  const { data, error } = await supabase
    .from("orders")
    .select("*, story_pages(*), approvals(*)")
    .eq("serial_code", id)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { ok: false, order: null, error: error.message },
      { status: 500 }
    );
  }

  if (data) {
    return NextResponse.json({ ok: true, order: mapOrderRow(data as OrderRow) });
  }

  const byPublicCode = await supabase
    .from("orders")
    .select("*, story_pages(*), approvals(*)")
    .eq("public_code", id)
    .maybeSingle();

  if (byPublicCode.error) {
    return NextResponse.json(
      { ok: false, order: null, error: byPublicCode.error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: Boolean(byPublicCode.data),
    order: byPublicCode.data ? mapOrderRow(byPublicCode.data as OrderRow) : null,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const snapshot = (await request.json()) as PrototypeOrder;
  const supabase = await createClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { ok: false, authenticated: false, message: "Login necessario." },
      { status: 401 }
    );
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .or(`serial_code.eq.${id},public_code.eq.${id}`)
    .maybeSingle();

  if (orderError || !orderRow) {
    return NextResponse.json(
      { ok: false, message: "Pedido nao encontrado.", error: orderError?.message },
      { status: orderError ? 500 : 404 }
    );
  }

  const orderId = orderRow.id as string;

  const { error: updateError } = await supabase
    .from("orders")
    .update({
      child_name: snapshot.childName,
      title: snapshot.title,
      city: snapshot.city,
      format: snapshot.format,
      pages: snapshot.pages,
      price_brl: snapshot.price,
      generation_cost_brl: snapshot.generationCost,
      print_cost_brl: snapshot.printCost,
      freight_cost_brl: snapshot.freightCost,
      financial_status: snapshot.financialStatus,
      stage: snapshot.stage,
      status_label: snapshot.statusLabel,
      briefing: snapshot.briefing,
    })
    .eq("id", orderId);

  if (updateError) {
    return NextResponse.json(
      { ok: false, message: "Nao consegui atualizar o pedido.", error: updateError.message },
      { status: 500 }
    );
  }

  if (snapshot.story.length > 0) {
    const { error } = await supabase.from("story_pages").upsert(
      snapshot.story.map((page) => ({
        order_id: orderId,
        page_number: page.pageNumber,
        scene: page.scene,
        page_text: page.text,
        emotion: page.emotion,
        required_elements: page.requiredElements,
        forbidden_elements: page.forbiddenElements,
      })),
      { onConflict: "order_id,page_number" }
    );

    if (error) return syncError(error.message);
  }

  if (snapshot.approvals.length > 0) {
    const { error } = await supabase.from("approvals").upsert(
      snapshot.approvals.map((approval) => ({
        order_id: orderId,
        label: approval.label,
        status: approval.status,
        revisions_used: approval.revisionsUsed,
        revisions_limit: approval.revisionsLimit,
        approved_at: approval.status === "approved" ? new Date().toISOString() : null,
      })),
      { onConflict: "order_id,label" }
    );

    if (error) return syncError(error.message);
  }

  const { data: fresh, error: freshError } = await supabase
    .from("orders")
    .select("*, story_pages(*), approvals(*)")
    .eq("id", orderId)
    .single();

  if (freshError) return syncError(freshError.message);

  return NextResponse.json({ ok: true, order: mapOrderRow(fresh as OrderRow) });
}

function syncError(message: string) {
  return NextResponse.json(
    { ok: false, message: "Pedido atualizado parcialmente.", error: message },
    { status: 500 }
  );
}
