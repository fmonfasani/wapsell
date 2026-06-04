import Link from "next/link";
import { BRAND } from "@/lib/constants";

// Deep forest green footer per Stitch design system. White type, generous
// padding, no logos or social icons until we have real ones.
export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-forest text-white">
      <div className="section py-14 md:py-20">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <Link
            href="/"
            className="flex items-baseline gap-1.5 font-display font-semibold text-xl"
          >
            <span>{BRAND.name}</span>
            <span aria-hidden className="text-amber text-sm tracking-tighter">
              {BRAND.symbol}
            </span>
          </Link>

          <nav className="flex flex-wrap gap-x-7 gap-y-3 text-sm text-white/80">
            <Link href="/demo-tour" className="hover:text-white">
              Producto
            </Link>
            <Link href="/demo-tour#precios" className="hover:text-white">
              Precio
            </Link>
            <Link href="/demo-tour#faq" className="hover:text-white">
              FAQ
            </Link>
            <a href={`mailto:hola@${BRAND.domain}`} className="hover:text-white">
              Contacto
            </a>
          </nav>

          <div className="text-xs text-white/60">
            <p>
              © {year} {BRAND.name}. Privacidad · Términos
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
