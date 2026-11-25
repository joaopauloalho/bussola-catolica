import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line bg-navy text-ivory">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-serif text-3xl">Bússola Católica</p>
          <p className="mt-2 text-gold-bright">
            Um guia gratuito para achar missa, confissão e adoração em Londrina.
          </p>
        </div>
        <div>
          <p className="font-bold">Páginas</p>
          <ul className="mt-2 space-y-1">
            <li>
              <Link href="/" className="underline-offset-4 hover:underline">
                Celebrações perto de você
              </Link>
            </li>
            <li>
              <Link href="/doar" className="underline-offset-4 hover:underline">
                Doação e transparência
              </Link>
            </li>
            <li>
              <Link href="/sobre" className="underline-offset-4 hover:underline">
                Como os dados são feitos
              </Link>
            </li>
          </ul>
        </div>
        <p className="text-base text-gold-bright">
          Este site não é a Arquidiocese de Londrina nem substitui o aviso da
          paróquia. Horários mudam em festas e solenidades. Confirme pelo
          telefone quando o horário estiver marcado como parcial ou a confirmar.
          O fuso usado é o de Brasília.
        </p>
      </div>
    </footer>
  );
}
