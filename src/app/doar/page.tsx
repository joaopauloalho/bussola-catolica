import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doar",
  description:
    "A Bússola Católica é gratuita e se sustenta só com doação. Veja a chave Pix de exemplo, a transparência e as metas.",
  alternates: { canonical: "/doar" },
};

const PIX_PLACEHOLDER = "PREENCHER-COM-A-CHAVE-PIX-REAL";

export default function DonatePage() {
  return (
    <div className="grid gap-8">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.14em] text-gold">
          Sem anúncio, sem dízimo
        </p>
        <h1 className="mt-2 font-serif text-5xl text-navy sm:text-6xl">
          Um site de graça, sustentado por quem quiser ajudar
        </h1>
        <p className="mt-4 max-w-3xl text-xl">
          A Bússola não cobra paróquia, não recolhe dízimo e não vende destaque
          na lista. O custo é de hospedagem, domínio e o tempo de conferir
          horários. Doação é opcional.
        </p>
      </header>

      <section className="rounded-[2rem] border-2 border-gold bg-paper p-6">
        <h2 className="font-serif text-4xl text-navy">Pix</h2>
        <p className="mt-3 text-lg">
          A chave abaixo é um espaço reservado. Não envie dinheiro para ela.
          Quem publicar o site precisa trocar este texto pela chave Pix da
          entidade responsável e só então divulgar a página.
        </p>
        <p className="mt-4 rounded-2xl bg-navy px-4 py-5 font-mono text-lg text-gold-bright sm:text-2xl">
          {PIX_PLACEHOLDER}
        </p>
        <p className="mt-3 font-bold">
          CHAVE PIX DE EXEMPLO — substituir antes de aceitar doações reais.
        </p>
      </section>

      <section className="grid gap-4">
        <h2 className="font-serif text-4xl text-navy">Transparência</h2>
        <p>
          Ainda não há associação, CNPJ ou conta publicados aqui. Enquanto isso,
          a página não pede doação real. Quando existir uma entidade responsável,
          esta seção deve mostrar, a cada semestre: quanto entrou, quanto foi
          gasto e o saldo.
        </p>
        <ul className="grid gap-3">
          <li className="rounded-3xl bg-paper p-5">
            <strong>Entradas até agora:</strong> R$ 0,00. Nenhuma doação foi
            recebida por este projeto.
          </li>
          <li className="rounded-3xl bg-paper p-5">
            <strong>Gastos previstos:</strong> domínio, hospedagem na Vercel no
            plano gratuito enquanto couber, e o trabalho voluntário de atualizar
            horários. Sem salário e sem repasse para paróquia por meio deste site.
          </li>
          <li className="rounded-3xl bg-paper p-5">
            <strong>O que não fazemos:</strong> não guardamos a localização de
            quem usa o site, não vendemos dados e não colocamos uma paróquia na
            frente da outra porque alguém pagou.
          </li>
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-serif text-4xl text-navy">Metas</h2>
        <ol className="grid gap-3">
          <li className="rounded-3xl border border-line bg-paper p-5">
            <strong>1. Conferir o que está a confirmar.</strong> Visitar ou
            telefonar para as paróquias cuja grade ainda não foi publicada com
            segurança.
          </li>
          <li className="rounded-3xl border border-line bg-paper p-5">
            <strong>2. Manter o site no ar, legível e sem anúncio.</strong> Fonte
            grande, contraste alto e mapa gratuito.
          </li>
          <li className="rounded-3xl border border-line bg-paper p-5">
            <strong>3. Só então pensar em outra cidade.</strong> Londrina precisa
            estar estável antes de qualquer expansão.
          </li>
        </ol>
      </section>
    </div>
  );
}
