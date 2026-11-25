import Link from "next/link";

const links = [
  { href: "/", label: "Missas" },
  { href: "/doar", label: "Doar" },
  { href: "/sobre", label: "Sobre" },
];

export function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ivory/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <Link href="/" className="flex items-center gap-3 rounded-full">
          <span
            aria-hidden
            className="grid h-12 w-12 place-items-center rounded-full bg-navy text-gold-bright"
          >
            <svg viewBox="0 0 48 48" className="h-8 w-8" fill="none">
              <circle cx="24" cy="24" r="16" stroke="currentColor" strokeWidth="2" />
              <path d="M24 8 L27.2 24 L24 40 L20.8 24 Z" fill="currentColor" />
              <circle cx="24" cy="24" r="2.5" className="fill-navy" />
            </svg>
          </span>
          <span>
            <span className="block font-serif text-[1.65rem] leading-none text-navy sm:text-2xl">
              Bússola Católica
            </span>
            <span className="block text-sm leading-tight text-muted">Londrina · de graça</span>
          </span>
        </Link>
        <nav aria-label="Principal" className="flex items-center gap-1 sm:gap-2">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-3 py-2 text-base font-bold text-navy hover:bg-white sm:px-4"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
