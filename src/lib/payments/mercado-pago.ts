import { getAppUrl, optionalServerEnv } from "@/lib/server/env";
import type { PrototypeOrder } from "@/lib/prototype-store";

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point?: string;
  sandbox_init_point?: string;
};

type MercadoPagoPayment = {
  id: number;
  status: string;
  status_detail?: string;
  external_reference?: string;
  transaction_amount?: number;
};

export function isMercadoPagoConfigured() {
  return Boolean(optionalServerEnv("MERCADO_PAGO_ACCESS_TOKEN"));
}

export async function createMercadoPagoPreference({
  order,
  payerEmail,
}: {
  order: PrototypeOrder;
  payerEmail?: string | null;
}) {
  const accessToken = optionalServerEnv("MERCADO_PAGO_ACCESS_TOKEN");

  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN nao configurada.");
  }

  const appUrl = getAppUrl();
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: [
        {
          id: order.serialCode,
          title: `Livro Magico personalizado - ${order.childName}`,
          description: `${order.pages} paginas, ${order.format}, impresso e enviado.`,
          quantity: 1,
          currency_id: "BRL",
          unit_price: order.price,
        },
      ],
      payer: payerEmail ? { email: payerEmail } : undefined,
      external_reference: order.serialCode,
      notification_url: `${appUrl}/api/webhooks/mercado-pago`,
      back_urls: {
        success: `${appUrl}/pagamento/retorno?status=success&order=${encodeURIComponent(order.serialCode)}`,
        pending: `${appUrl}/pagamento/retorno?status=pending&order=${encodeURIComponent(order.serialCode)}`,
        failure: `${appUrl}/pagamento/retorno?status=failure&order=${encodeURIComponent(order.serialCode)}`,
      },
      auto_return: "approved",
      metadata: {
        public_code: order.publicCode,
        child_name: order.childName,
        book_title: order.title,
      },
    }),
  });

  const data = (await response.json()) as MercadoPagoPreferenceResponse & {
    message?: string;
    error?: string;
  };

  if (!response.ok) {
    throw new Error(data.message || data.error || "Erro ao criar preferencia no Mercado Pago.");
  }

  return {
    preferenceId: data.id,
    checkoutUrl: data.init_point || data.sandbox_init_point || "",
    raw: data,
  };
}

export async function fetchMercadoPagoPayment(paymentId: string) {
  const accessToken = optionalServerEnv("MERCADO_PAGO_ACCESS_TOKEN");

  if (!accessToken) {
    throw new Error("MERCADO_PAGO_ACCESS_TOKEN nao configurada.");
  }

  const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  const data = (await response.json()) as MercadoPagoPayment & { message?: string };

  if (!response.ok) {
    throw new Error(data.message || "Erro ao consultar pagamento no Mercado Pago.");
  }

  return data;
}

export function mapMercadoPagoStatus(status: string) {
  if (status === "approved") return "paid";
  if (["pending", "in_process", "authorized"].includes(status)) return "awaiting_payment";
  return "manual_review";
}
