import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

// Shared page chrome for /privacy and /terms. Constrains the legal copy to a
// readable 720px measure on top of the cream background, with consistent
// typographic hierarchy across both languages. Headings use the display serif
// to keep the brand voice; body stays in Inter for legibility.
export function LegalShell({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <Nav />
      <main>
        <section className="section max-w-prose py-16 md:py-24">
          <p className="eyebrow mb-4">{updated}</p>
          <h1 className="font-display font-semibold text-4xl md:text-5xl text-ink mb-12">
            {title}
          </h1>

          <article className="legal-prose">{children}</article>
        </section>
      </main>
      <Footer />
    </>
  );
}
