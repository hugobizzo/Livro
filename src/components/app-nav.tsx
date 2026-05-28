import Link from "next/link";
import { BarChart3, Home, LayoutDashboard, PlusCircle, UserRound } from "lucide-react";
import { Logo } from "./logo";

const navItems = [
  { href: "/", label: "Site", icon: Home },
  { href: "/novo-livro", label: "Novo livro", icon: PlusCircle },
  { href: "/cliente", label: "Cliente", icon: UserRound },
  { href: "/admin", label: "Admin", icon: LayoutDashboard },
  { href: "/admin?tab=metricas", label: "Metricas", icon: BarChart3 },
];

export function AppNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#d9ddd9] bg-[#fbf8f1]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <Logo />
        <nav className="desktop-nav items-center gap-1" aria-label="Navegacao principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-[#40504c] transition hover:bg-white hover:text-[#0f5f63]"
              >
                <Icon className="size-4" aria-hidden="true" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <Link
          href="/login"
          className="shrink-0 rounded-xl bg-[#173331] px-3 py-2 text-sm font-semibold text-white transition hover:bg-[#0f5f63] sm:px-4"
        >
          Entrar
        </Link>
      </div>
    </header>
  );
}
