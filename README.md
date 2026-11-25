# Bússola Católica

Guia gratuito, em português, para achar missa, confissão e adoração em Londrina (PR). A lista sai em ordem do próximo horário, com a distância em quilômetros e um mapa do OpenStreetMap.

O site não é a Arquidiocese de Londrina. Horário que não está publicado pela comunidade fica **a confirmar**. Nada é inventado.

## Stack

- Next.js (App Router, TypeScript, Tailwind)
- Supabase (Postgres, leitura pública) com arquivo local de reserva
- Leaflet e tiles do OpenStreetMap
- Fuso `America/Sao_Paulo`
- Pensado para a Vercel no plano Hobby

## Rodar localmente

```bash
npm install
cp .env.example .env.local
npm run dev
```

Sem variáveis, ou com o banco vazio, o site usa `data/places.json`. Quando a tabela `places` tem linhas, a leitura passa a vir do Supabase.

```bash
npm test
npm run lint
npm run build
```

`npm run seed:sql` regrava `supabase/seed.sql` a partir do JSON.

## Banco

1. No SQL Editor do Supabase, execute `supabase/migrations/0001_init.sql`.
2. Em seguida execute `supabase/seed.sql`.

A migração liga RLS: qualquer pessoa lê paróquias e horários; a tabela `suggestions` só aceita inserção. Não há leitura pública das sugestões.

Variáveis (também em `.env.example`):

| Nome | Valor deste projeto |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `https://twnszsbeubpwzmncqwbq.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_YyK36DIdTal5i8J336uYMg_xmyFs_xG` |
| `NEXT_PUBLIC_SITE_URL` | URL pública do deploy, sem barra no final. Na Vercel pode ficar vazia. |

A chave publishable é pública. Não use a secret key no site.

## Publicar na Vercel (Hobby)

1. Envie este repositório para o GitHub.
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório. Framework: Next.js. O build padrão `npm run build` é o correto.
3. Em Settings → Environment Variables, crie as três variáveis da tabela acima para Production (e Preview, se quiser).
4. Faça o deploy. O plano Hobby cabe: páginas com revalidação de uma hora, mapa no navegador, sem função longa.
5. Abra o site. Enquanto o SQL não tiver sido aplicado, a home diz que os horários vêm do arquivo local. Depois do seed, diz que vêm do banco publicado.
6. Troque a chave Pix de exemplo em `src/app/doar/page.tsx` antes de divulgar doações. O texto `PREENCHER-COM-A-CHAVE-PIX-REAL` não recebe dinheiro.
7. Se usar domínio próprio, atualize `NEXT_PUBLIC_SITE_URL` e faça um novo deploy para o sitemap e o Open Graph.

## O que entrou na coleta

Conferido em 25/11/2026. Coordenadas pelo Nominatim/OpenStreetMap. “Edifício” é um ponto de lugar no mapa; “via” é o trecho da rua, porque o número não estava interpolado.

### Grade confirmada no site da comunidade

| Lugar | Fonte |
| --- | --- |
| Catedral Metropolitana Sagrado Coração de Jesus | https://catedrallondrina.com.br/ |
| Paróquia Coração de Maria | https://cordemaria.com.br/horarios/ |
| Paróquia Imaculada Conceição | https://imaculadalondrina.com.br/ |
| Paróquia Nossa Senhora Rainha dos Apóstolos | https://rainhadosapostolos.com.br/ |
| Paróquia Nossa Senhora Rainha do Universo | https://rainhadouniverso.com.br/horarios/ |
| Paróquia São Vicente de Paulo | https://saovicentelondrina.com.br/horarios-de-missas/ |
| Paróquia Sant'Ana (matriz) | https://paroquiasantanalondrina.org/santa-missa/ |
| Santuário Santa Rita de Cássia | https://santaritalondrina.com.br/paroquias |
| Paróquia Nossa Senhora Auxiliadora | https://auxiliadoraonline.com.br/ |
| Paróquia São José Operário | https://saojoselondrina.com.br/ |
| Paróquia Cristo Bom Pastor (matriz) | https://paroquiacristobompastor.com.br/p/atividades-permanentes |
| Capela São Cristóvão (Mister Thomas) | https://paroquiacristobompastor.com.br/p/atividades-permanentes |

### Parcial

| Lugar | O que está na grade | O que ficou de fora |
| --- | --- | --- |
| Paróquia dos Sagrados Corações | Horários que estavam na página da paróquia | O domínio não respondeu de novo em 25/11/2026. Telefone da Arquidiocese: (43) 3329-7064. https://www.paroquiasagradoscoracoes.com.br/horarios-de-missas/ |
| Paróquia Mãe da Divina Providência | Notícia de 07/10/2026 e o rodapé do mesmo site | Sábado às 18h está na notícia; o primeiro sábado (9h adoração, 10h missa) está no rodapé. https://mdprovidencia.com.br/noticias/horario-de-missa |
| Paróquia Pessoal Nipo-Brasileira | Domingo às 8h30 | Dias de semana não publicados. https://www.imaculadanipo.com.br/missas |

### A confirmar

O lugar e o endereço entram. A grade não, porque a fonte não era o site da paróquia ou as fontes divergiam.

| Lugar | Fonte do endereço |
| --- | --- |
| Paróquia Nossa Senhora das Graças | https://arquidioceselondrina.com.br/paroquias/parquia-nossa-senhora-das-graas |
| Paróquia Cristo Redentor | https://arquidioceselondrina.com.br/paroquias |
| Paróquia Santa Terezinha do Menino Jesus | https://portalcdicbr.cnbb.org.br/igreja/d2188ffe-5fe4-4896-8153-1476e194a9c8 |
| Paróquia Nossa Senhora de Fátima | https://divisaodaigreja.com/paroquia-nossa-senhora-de-fatima-vila-casoni/ |
| Paróquia Nossa Senhora de Nazaré | https://paroquianazare.com.br/ |

## Etiquetas

Só quando a fonte afirma: Missa, Confissão, Adoração, Acessível (Imaculada Conceição descreve acolhida a cadeirantes), Estacionamento (São Vicente de Paulo, no texto da Arquidiocese sobre o centro pastoral). Confissão por agendamento, sem hora publicada, leva a etiqueta e não ganha um horário fictício.
