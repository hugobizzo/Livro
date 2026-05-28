import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  fetchMercadoPagoPayment,
  mapMercadoPagoStatus,
} from "@/lib/payments/mercado-pago";
import { optionalServerEnv } from "@/lib/server/env";

type MercadoPagoNotification = {
  type?: string;
  action?: string;
  data?: { id?: string };
  id?: string;
};

export async function POST(request: Request) {
  const url = new URL(request.url);
  const rawBody = await request.text();
  const body = rawBody ? (JSON.parse(rawBody) as MercadoPagoNotification) : {};
  const paymentId = body.data?.id || body.id || url.searchParams.get("data.id") || "";

  if (!paymentId) {
    return NextResponse.json({ ok: true, ignored: true, reason: "Sem payment id." });
  }

  if (!isValidSignature(request, paymentId)) {
    return NextResponse.json(
      { ok: false, message: "Assinatura invalida." },
      { status: 401 }
    );
  }

  try {
    const payment = await fetchMercadoPagoPayment(paymentId);
    const externalReference = payment.external_reference;

    if (!externalReference) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Sem external_reference." });
    }

    const supabase = createAdminClient();
    const financialStatus = mapMercadoPagoStatus(payment.status);

    const { data: orderRow } = await supabase
      .from("orders")
      .select("id")
      .eq("serial_code", externalReference)
      .maybeSingle();

    if (!orderRow) {
      return NextResponse.json({ ok: true, ignored: true, reason: "Pedido nao encontrado." });
    }

    await supabase.from("payments").insert({
      order_id: orderRow.id,
      provider: "mercado_pago",
      provider_payment_id: String(payment.id),
      external_reference: externalReference,
      status: payment.status,
      amount_brl: payment.transaction_amount ?? 0,
      raw_payload: payment,
    });

    await supabase
      .from("orders")
      .update({
        financial_status: financialStatus,
        status_label:
          financialStatus === "paid"
            ? "Pagamento confirmado; historia aguardando aprovacao."
            : "Pagamento em verificacao.",
      })
      .eq("id", orderRow.id);

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido.";
    return NextResponse.json(
      { ok: false, message },
      { status: 500 }
    );
  }
}

function isValidSignature(request: Request, dataId: string) {
  const secret = optionalServerEnv("MERCADO_PAGO_WEBHOOK_SECRET");
  if (!secret) return true;

  const xSignature = request.headers.get("x-signature") ?? "";
  const xRequestId = request.headers.get("x-request-id") ?? "";
  const parts = Object.fromEntries(
    xSignature.split(",").map((part) => {
      const [key, value] = part.split("=");
      return [key?.trim(), value?.trim()];
    })
  );
  const ts = parts.ts;
  const v1 = parts.v1;

  if (!ts || !v1 || !xRequestId) return false;

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
  const expected = createHmac("sha256", secret).update(manifest).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(v1));
  } catch {
    return false;
  }
}
