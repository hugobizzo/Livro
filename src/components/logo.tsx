import Link from "next/link";
import { BookOpen, Sparkles } from "lucide-react";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="flex items-center gap-3" aria-label="Livro Magico">
      <span className="flex size-11 items-center justify-center rounded-2xl bg-[#0f5f63] text-white shadow-sm">
        <BookOpen className="size-5" aria-hidden="true" />
      </span>
      <span className="min-w-0">
        <span className="flex items-center gap-1 text-lg font-semibold text-[#173331]">
          Livro Magico
          <Sparkles className="size-4 text-[#c77d35]" aria-hidden="true" />
        </span>
        <span className="hidden text-xs text-[#6d716f] sm:block">livros infantis sob medida</span>
      </span>
    </Link>
  );
}
