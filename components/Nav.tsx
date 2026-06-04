import Link from "next/link";
import { BRAND, WA_LINK } from "@/lib/constants";

// Sticky 64px nav. Left: wordmark + lever symbol. Right: 2 text links + CTA pill.
// Border-bottom uses cream-300 so the nav blends into the page until you scroll.
export function Nav() {
  return (
    <header className="sticky top-0 z-50 bg-cream/80 backdrop-blur border-b border-cream-300">
      <nav className="section flex items-center justify-between h-16">
        <Link
          href="/"
          className="flex items-baseline gap-1.5 font-display font-semibold text-xl text-ink"
        >
          <span>{BRAND.name}</span>
          <span aria-hidden className="text-amber text-sm tracking-tighter">
            {BRAND.symbol}
          </span>
        </Link>

        <div className="flex items-center gap-7">
          <Link
            href="/demo-tour"
            className="hidden sm:inline text-sm font-medium text-ink hover:text-amber transition-colors"
          >
            Producto
          </Link>
          <Link
            href="/demo-tour#precios"
            className="hidden sm:inline text-sm font-medium text-ink hover:text-amber transition-colors"
          >
            Precio
          </Link>
          <a
            href={WA_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary !h-10 !px-5 text-sm"
          >
            Hablá con {BRAND.name}
          </a>
        </div>
      </nav>
    </header>
  );
}
