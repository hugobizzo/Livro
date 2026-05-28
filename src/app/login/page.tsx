import Link from "next/link";
import { LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Logo } from "@/components/logo";
import { login, signup } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ message?: string }>;
}) {
  const message = (await searchParams).message;

  return (
    <main className="mx-auto grid min-h-[calc(100vh-76px)] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_420px] lg:px-8">
      <section className="flex flex-col justify-center">
        <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[#0f5f63]">
          Acesso seguro
        </p>
        <h1 className="mt-4 max-w-2xl text-4xl font-semibold leading-tight text-[#173331]">
          Cliente e admin entram pelo mesmo produto, com permissoes separadas.
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
          Use e-mail e senha enquanto preparamos login social.
        </p>

        {message && (
          <div className="mt-5 rounded-2xl border border-[#f1d394] bg-[#fff4dc] p-4 text-sm font-medium text-[#7a5012]">
            {message}
          </div>
        )}

        <form className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-[#40504c]">E-mail</span>
            <span className="mt-2 flex items-center gap-2 rounded-2xl border border-[#d9ddd9] bg-[#fbf8f1] px-4 py-3">
              <Mail className="size-4 text-[#68716e]" aria-hidden="true" />
              <input
                name="email"
                type="email"
                required
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
                name="password"
                type="password"
                required
                minLength={8}
                placeholder="Minimo 8 caracteres"
                className="w-full bg-transparent text-sm outline-none"
              />
            </span>
          </label>
          <button
            formAction={login}
            className="flex w-full items-center justify-center rounded-2xl bg-[#173331] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#0f5f63]"
          >
            Entrar
          </button>
          <button
            formAction={signup}
            className="flex w-full items-center justify-center rounded-2xl border border-[#d9ddd9] px-5 py-3 text-sm font-semibold text-[#173331] transition hover:bg-[#fbf8f1]"
          >
            Criar conta
          </button>
        </form>

        <div className="mt-5 grid gap-3 text-sm">
          <Link href="/cliente" className="text-center font-semibold text-[#0f5f63]">
            Continuar teste local como cliente
          </Link>
          <Link href="/admin" className="text-center font-semibold text-[#0f5f63]">
            Abrir painel local do dono
          </Link>
        </div>
      </section>
    </main>
  );
}
