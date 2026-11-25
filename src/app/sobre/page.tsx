import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre",
  description:
    "Como a Bússola Católica reúne paróquias de Londrina, de onde vêm os horários e o que fazemos quando um horário não está publicado.",
  alternates: { canonical: "/sobre" },
};

export default function AboutPage() {
  return (
    <div className="grid max-w-3xl gap-6 text-lg">
      <header>
        <h1 className="font-serif text-5xl text-navy sm:text-6xl">Sobre a Bússola</h1>
        <p className="mt-4 text-xl">
          A Bússola Católica ajuda quem está em Londrina a achar a próxima missa,
          confissão ou adoração, com a distância a partir de onde a pessoa está.
        </p>
      </header>
      <section className="grid gap-3">
        <h2 className="font-serif text-4xl text-navy">O que este site é</h2>
        <p>
          É um projeto gratuito e sem fins lucrativos. Não pertence à Arquidiocese
          de Londrina e não substitui o informe da paróquia. A ordem da lista é a
          do próximo horário, não uma recomendação.
        </p>
      </section>
      <section className="grid gap-3">
        <h2 className="font-serif text-4xl text-navy">De onde vêm os horários</h2>
        <p>
          Endereços vêm da Arquidiocese, do cadastro da CNBB ou do site da própria
          paróquia. Coordenadas vêm do OpenStreetMap, via Nominatim. Horários só
          entram quando uma página da paróquia os publica. Se a fonte é incompleta,
          antiga ou contraditória, a ficha fica como <strong>a confirmar</strong>{" "}
          em vez de receber um horário inventado.
        </p>
        <p>
          Cada paróquia guarda o link da fonte e, quando a grade foi lida, a data
          da última confirmação. O fuso de todas as contas é America/Sao_Paulo.
        </p>
      </section>
      <section className="grid gap-3">
        <h2 className="font-serif text-4xl text-navy">Sua localização</h2>
        <p>
          O botão “Usar minha localização” pede a posição ao navegador e usa esse
          ponto só para calcular quilômetros. Nada é gravado em banco, cookie ou
          neste aparelho. Se o GPS for negado, a referência passa a ser o centro
          de Londrina ou um bairro escolhido por você.
        </p>
      </section>
      <section className="grid gap-3">
        <h2 className="font-serif text-4xl text-navy">Correções</h2>
        <p>
          Na página de cada comunidade há o formulário “Sugerir correção”. Ele
          grava a mensagem na tabela de sugestões, quando o banco está publicado.
          A correção só entra na grade depois de conferida na fonte.
        </p>
        <p>
          <Link href="/" className="font-bold text-navy underline">
            Voltar às celebrações
          </Link>
        </p>
      </section>
      <section className="grid gap-3">
        <h2 className="font-serif text-4xl text-navy">Créditos</h2>
        <p>
          Mapa: OpenStreetMap e seus colaboradores. Tiles gratuitos do
          OpenStreetMap. Banco: Supabase. Hospedagem prevista: Vercel, plano Hobby.
        </p>
      </section>
    </div>
  );
}
