import { NextResponse } from "next/server";
import { hasSupabaseEnv } from "@/lib/supabase";

const SLUG = /^[a-z0-9-]{1,80}$/;

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Não entendemos a mensagem enviada." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Mensagem inválida." }, { status: 400 });
  }
  const record = body as Record<string, unknown>;
  if (typeof record.company === "string" && record.company.trim()) {
    return NextResponse.json({ ok: true });
  }
  const message = typeof record.message === "string" ? record.message.trim() : "";
  const authorName =
    typeof record.authorName === "string" ? record.authorName.trim() : "";
  const contact = typeof record.contact === "string" ? record.contact.trim() : "";
  const placeSlug =
    typeof record.placeSlug === "string" ? record.placeSlug.trim() : "";

  if (message.length < 10 || message.length > 2000) {
    return NextResponse.json(
      { error: "Escreva a correção com pelo menos 10 caracteres." },
      { status: 400 },
    );
  }
  if (authorName.length > 120 || contact.length > 160) {
    return NextResponse.json(
      { error: "Nome ou contato estão longos demais." },
      { status: 400 },
    );
  }
  if (placeSlug && !SLUG.test(placeSlug)) {
    return NextResponse.json({ error: "Paróquia inválida." }, { status: 400 });
  }
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!hasSupabaseEnv() || !url || !key) {
    return NextResponse.json(
      {
        error:
          "O envio abre quando o Supabase estiver configurado. Enquanto isso, ligue para a paróquia.",
      },
      { status: 503 },
    );
  }

  const response = await fetch(`${url}/rest/v1/suggestions`, {
    method: "POST",
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({
      place_slug: placeSlug || null,
      author_name: authorName || null,
      contact: contact || null,
      message,
    }),
  });

  if (!response.ok) {
    return NextResponse.json(
      {
        error:
          "Ainda não deu para guardar a sugestão. A tabela pode não ter sido criada. Use o telefone da paróquia.",
      },
      { status: 503 },
    );
  }
  return NextResponse.json({ ok: true });
}
