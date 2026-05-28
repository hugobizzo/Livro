import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, LockKeyhole, QrCode } from "lucide-react";
import { getOrderByPublicCode } from "@/lib/mock-data";

export default async function PublicQrPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  const order = getOrderByPublicCode(code);

  if (!order) {
    notFound();
  }

  return (
    <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_380px] lg:px-8">
      <section className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
          Exemplar rastreavel
        </p>
        <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#173331]">
          Este QR code pertence a um livro produzido pelo Livro Magico.
        </h1>
        <p className="mt-4 max-w-2xl text-[#68716e]">
          Para proteger a privacidade da crianca, detalhes do pedido so aparecem para o comprador logado ou para o admin.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
          >
            <LockKeyhole className="size-4" aria-hidden="true" />
            Entrar para ver pedido
          </Link>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#d9ddd9] px-5 py-3 text-sm font-semibold text-[#173331] transition hover:bg-white"
          >
            Conhecer o Livro Magico
          </Link>
        </div>
      </section>

      <aside className="self-center rounded-3xl border border-[#d9ddd9] bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex size-28 items-center justify-center rounded-3xl bg-[#e8f2f4] text-[#0f5f63]">
          <QrCode className="size-14" aria-hidden="true" />
        </div>
        <h2 className="mt-6 text-xl font-semibold text-[#173331]">{order.serialCode}</h2>
        <p className="mt-2 text-sm text-[#68716e]">Codigo publico: {order.publicCode}</p>
        <div className="mt-6 rounded-2xl bg-[#fbf8f1] p-4">
          <BookOpen className="mx-auto size-5 text-[#c77d35]" aria-hidden="true" />
          <p className="mt-3 text-sm text-[#59635f]">
            Pagina publica sem nome da crianca, fotos ou endereco.
          </p>
        </div>
      </aside>
    </main>
  );
}
