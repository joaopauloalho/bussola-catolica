"use client";

import { useState } from "react";

export function SuggestionForm({
  placeSlug,
  placeName,
}: {
  placeSlug: string;
  placeName: string;
}) {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState("");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setStatus("sending");
    setMessage("");
    try {
      const response = await fetch("/api/sugestoes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          placeSlug,
          authorName: String(form.get("authorName") ?? ""),
          contact: String(form.get("contact") ?? ""),
          message: String(form.get("message") ?? ""),
          company: String(form.get("company") ?? ""),
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setStatus("error");
        setMessage(payload.error || "Não foi possível enviar agora.");
        return;
      }
      setStatus("sent");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
      setMessage("A conexão falhou. Tente de novo em alguns minutos.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4" noValidate>
      <h2 className="font-serif text-4xl text-navy">Sugerir correção</h2>
      <p>
        Viu um horário diferente em {placeName}? Escreva o que precisa mudar.
        A sugestão fica guardada para revisão e não aparece no site sozinha.
      </p>
      <label className="grid gap-1 font-bold">
        Seu nome
        <span className="font-normal text-muted">opcional</span>
        <input
          name="authorName"
          autoComplete="name"
          maxLength={120}
          className="min-h-14 rounded-2xl border border-line bg-white px-4 text-lg font-normal"
        />
      </label>
      <label className="grid gap-1 font-bold">
        Telefone ou e-mail
        <span className="font-normal text-muted">opcional, se pudermos responder</span>
        <input
          name="contact"
          autoComplete="email"
          maxLength={160}
          className="min-h-14 rounded-2xl border border-line bg-white px-4 text-lg font-normal"
        />
      </label>
      <label className="grid gap-1 font-bold">
        O que corrigir
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={2000}
          rows={5}
          className="rounded-2xl border border-line bg-white px-4 py-3 text-lg font-normal"
        />
      </label>
      <label className="absolute -left-[9999px]" aria-hidden>
        Empresa
        <input name="company" tabIndex={-1} autoComplete="off" />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="min-h-14 rounded-full bg-navy px-6 text-lg font-bold text-white disabled:opacity-60"
      >
        {status === "sending" ? "Enviando…" : "Enviar sugestão"}
      </button>
      {status === "sent" ? (
        <p role="status" className="rounded-2xl bg-moss/10 px-4 py-3 text-moss">
          Recebemos a sugestão. Obrigado por cuidar da informação.
        </p>
      ) : null}
      {status === "error" ? (
        <p role="alert" className="rounded-2xl bg-white px-4 py-3 text-navy">
          {message}
        </p>
      ) : null}
    </form>
  );
}
