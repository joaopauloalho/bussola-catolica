import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-10">
      <h1 className="font-serif text-5xl text-navy">Não encontramos esta página</h1>
      <p className="mt-4 text-xl">
        O endereço pode ter mudado. A lista de celebrações continua na página inicial.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-14 items-center rounded-full bg-navy px-6 font-bold text-white"
      >
        Ver celebrações
      </Link>
    </div>
  );
}
