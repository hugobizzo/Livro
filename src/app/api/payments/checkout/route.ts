import { NextResponse } from "next/server";
import type { PrototypeOrder } from "@/lib/prototype-store";
import { createClient } from "@/lib/supabase/server";
import {
  createMercadoPagoPreference,
  isMercadoPagoConfigured,
} from "@/lib/payments/mercado-pago";

export async function POST(request: Request) {
  const body = (await request.json()) as { order?: PrototypeOrder };

  if (!body.order) {
    return NextResponse.json(
      { ok: false, message: "Pedido ausente." },
      { status: 400 }
    );
  }

  if (!isMercadoPagoConfigured()) {
    return NextResponse.json(
      {
        ok: false,
        configured: false,
        message: "Mercado Pago ainda nao configurado. O pedido foi salvo, mas o pagamento real esta pendente.",
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
      { ok: false, message: "Entre na conta para pagar e salvar o pedido online." },
      { status: 401 }
    );
  }

  const { data: orderRow, error: orderError } = await supabase
    .from("orders")
    .select("id")
    .eq("serial_code", body.order.serialCode)
    .maybeSingle();

  if (orderError || !orderRow) {
    return NextResponse.json(
      { ok: false, message: "Salve o pedido online antes do pagamento.", error: orderError?.message },
      { status: 400 }
    );
  }

  try {
    const preference = await createMercadoPagoPreference({
      order: body.order,
      payerEmail: user.email,
    });

    await supabase.from("payments").insert({
      order_id: orderRow.id,
      provider: "mercado_pago",
      preference_id: preference.preferenceId,
      checkout_url: preference.checkoutUrl,
      external_reference: body.order.serialCode,
      status: "preference_created",
      amount_brl: body.order.price,
      raw_payload: preference.raw,
    });

    await supabase
      .from("orders")
      .update({
        financial_status: "awaiting_payment",
        status_label: "Pagamento aguardando confirmacao.",
      })
      .eq("id", orderRow.id);

    return NextResponse.json({
      ok: true,
      provider: "mercado_pago",
      checkoutUrl: preference.checkoutUrl,
      preferenceId: preference.preferenceId,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json(
      { ok: false, message: "Nao consegui iniciar o pagamento.", error: message },
      { status: 500 }
    );
  }
}
