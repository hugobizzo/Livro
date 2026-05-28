import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, PackageCheck, QrCode, Wand2 } from "lucide-react";

const proofPoints = [
  "Historia, personagens e capa com aprovacao por etapa",
  "Livro fisico impresso em grafica parceira",
  "QR code e serial para rastrear cada exemplar",
];

const moments = [
  "Aniversario",
  "Nascimento",
  "Dia dos Pais",
  "Natal",
  "Primeiro dia de escola",
  "Presente dos avos",
];

export default function Home() {
  return (
    <main>
      <section className="relative min-h-[calc(100vh-76px)] overflow-hidden">
        <Image
          src="/livro-magico-hero.png"
          alt="Livro infantil aberto com luzes magicas e paginas ilustradas"
          fill
          priority
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#173331]/88 via-[#173331]/58 to-transparent" />
        <div className="relative mx-auto flex min-h-[calc(100vh-76px)] max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="w-full min-w-0 max-w-[358px] text-white lg:max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#f0c878]">
              Livro fisico personalizado
            </p>
            <h1 className="mt-5 text-4xl font-semibold leading-tight sm:text-6xl">
              Uma historia impressa para uma crianca unica.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-8 text-[#f7efe3] sm:text-lg">
              O cliente envia fotos, tema e carinho. O Livro Magico transforma tudo em uma aventura infantil pronta para aprovar, imprimir e entregar.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/novo-livro"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#f0c878] px-6 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#ffd98f] sm:w-auto"
              >
                Comecar um livro
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <Link
                href="/admin"
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-white/12 px-6 py-3 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/20 sm:w-auto"
              >
                Painel do dono
              </Link>
            </div>
            <ul className="mt-10 grid gap-3 text-sm text-[#fff8e8]">
              {proofPoints.map((point) => (
                <li key={point} className="flex items-center gap-3">
                  <CheckCircle2 className="size-5 text-[#f0c878]" aria-hidden="true" />
                  <span className="min-w-0">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-4 py-14 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="rounded-2xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <Wand2 className="size-7 text-[#c77d35]" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-semibold text-[#173331]">Criacao guiada</h2>
          <p className="mt-3 text-sm leading-6 text-[#59635f]">
            Briefing por texto ou voz, sugestoes prontas e validacao de seguranca infantil antes de gerar o livro.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <PackageCheck className="size-7 text-[#0f5f63]" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-semibold text-[#173331]">Producao fisica</h2>
          <p className="mt-3 text-sm leading-6 text-[#59635f]">
            PDF para grafica, pacote de impressao, status de envio e controle de margem por pedido.
          </p>
        </div>
        <div className="rounded-2xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
          <QrCode className="size-7 text-[#b85545]" aria-hidden="true" />
          <h2 className="mt-5 text-xl font-semibold text-[#173331]">Rastreabilidade</h2>
          <p className="mt-3 text-sm leading-6 text-[#59635f]">
            QR code e serial conectam cada exemplar ao pedido, sem expor dados pessoais em pagina publica.
          </p>
        </div>
      </section>

      <section className="border-y border-[#d9ddd9] bg-[#f0ebe0]">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-10 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
              Momentos de compra
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-[#173331]">
              Datas afetivas com alto valor percebido.
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {moments.map((moment) => (
              <span key={moment} className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#40504c]">
                {moment}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
