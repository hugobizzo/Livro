import { BriefingWizard } from "@/components/briefing-wizard";

export default function NewBookPage() {
  return (
    <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[320px_1fr] lg:px-8">
      <aside className="rounded-[28px] border border-[#d9ddd9] bg-[#173331] p-6 text-white shadow-sm lg:sticky lg:top-28 lg:h-fit">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f0c878]">
          Livro Magico
        </p>
        <h1 className="mt-4 text-3xl font-semibold leading-tight">
          Comece com uma ideia. O livro nasce aos poucos.
        </h1>
        <div className="mt-8 space-y-3 text-sm">
          {[
            "Ideia livre por texto ou voz.",
            "Personagens com referencia individual.",
            "Historia editavel antes da aprovacao.",
            "Livro fisico com serial e QR.",
          ].map((item) => (
            <div key={item} className="rounded-2xl bg-white/10 p-4">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-6 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm leading-6 text-[#e6eee8]">
          Produto inicial: A5 vertical, 16 paginas, impresso e enviado para o cliente.
        </div>
      </aside>
      <BriefingWizard />
    </main>
  );
}
