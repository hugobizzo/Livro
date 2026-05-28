import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";

export default function LoginPage() {
  return (
    <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
          Acesso seguro
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[#173331]">
          Cliente, admin e grafica entram pelo mesmo produto, com permissoes separadas.
        </h1>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            ["Cliente", "Aprova etapas e acompanha o pedido."],
            ["Admin", "Controla producao, custos e qualidade."],
            ["Grafica", "Recebe pacote quando integracao existir."],
          ].map(([title, text]) => (
            <div key={title} className="rounded-2xl border border-[#d9ddd9] bg-white p-5 shadow-sm">
              <ShieldCheck className="size-5 text-[#0f5f63]" aria-hidden="true" />
              <h2 className="mt-4 font-semibold text-[#173331]">{title}</h2>
              <p className="mt-2 text-sm text-[#68716e]">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="self-center rounded-3xl border border-[#d9ddd9] bg-white p-6 shadow-sm">
        <Logo />
        <h2 className="mt-8 text-2xl font-semibold text-[#173331]">Entrar no Livro Magico</h2>
        <p className="mt-2 text-sm text-[#68716e]">
          Acesso visual nesta versao local. Login seguro entra na proxima fase.
        </p>
        <div className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#40504c]">E-mail</span>
            <span className="mt-2 flex items-center gap-2 rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] px-4 py-3">
              <Mail className="size-4 text-[#68716e]" aria-hidden="true" />
              <input
                type="email"
                placeholder="voce@email.com"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>
          <label className="block">
            <span className="text-sm font-medium text-[#40504c]">Senha</span>
            <span className="mt-2 flex items-center gap-2 rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] px-4 py-3">
              <LockKeyhole className="size-4 text-[#68716e]" aria-hidden="true" />
              <input
                type="password"
                placeholder="Sua senha"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>
          <Link
            href="/cliente"
            className="flex w-full items-center justify-center rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
          >
            Entrar como cliente
          </Link>
          <Link
            href="/admin"
            className="flex w-full items-center justify-center rounded-2xl border border-[#d9ddd9] px-5 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
          >
            Entrar como admin
          </Link>
        </div>
      </section>
    </main>
  );
}
