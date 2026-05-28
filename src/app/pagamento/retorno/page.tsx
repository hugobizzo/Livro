import Link from "next/link";
import { CheckCircle2, Clock3, XCircle } from "lucide-react";

export default async function PaymentReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; order?: string }>;
}) {
  const params = await searchParams;
  const status = params.status ?? "pending";
  const order = params.order ?? "";
  const isSuccess = status === "success";
  const isFailure = status === "failure";
  const Icon = isSuccess ? CheckCircle2 : isFailure ? XCircle : Clock3;

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-3xl items-center px-4 py-12 sm:px-6">
      <section className="w-full rounded-3xl border border-[#d9ddd9] bg-white p-8 text-center shadow-sm">
        <Icon
          className={`mx-auto size-12 ${
            isSuccess ? "text-[#146448]" : isFailure ? "text-[#9a3f2f]" : "text-[#c77d35]"
          }`}
          aria-hidden="true"
        />
        <h1 className="mt-5 text-3xl font-semibold text-[#173331]">
          {isSuccess
            ? "Pagamento recebido"
            : isFailure
              ? "Pagamento nao concluido"
              : "Pagamento em analise"}
        </h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-[#68716e]">
          {isSuccess
            ? "Vamos continuar a producao do livro e manter o status atualizado no pedido."
            : "Voce pode voltar ao pedido e tentar novamente quando quiser."}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href={order ? `/cliente/pedidos/${order}` : "/cliente"}
            className="inline-flex justify-center rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white"
          >
            Ver pedido
          </Link>
          <Link
            href="/cliente"
            className="inline-flex justify-center rounded-2xl border border-[#d9ddd9] px-5 py-3 text-sm font-semibold text-[#173331]"
          >
            Area do cliente
          </Link>
        </div>
      </section>
    </main>
  );
}
