"use client";

import { useState, type FormEvent } from "react";
import { buildWhatsappLink, validateLead, type LeadErrors, type LeadValues } from "@/lib/lead";
import { site } from "@/lib/site";

/**
 * Formularul de contact.
 *
 * Site-ul e static (GitHub Pages), deci nu există server care să trimită un
 * email. În loc să afișăm „mesaj trimis!” fără să trimitem nimic, formularul
 * validează și deschide WhatsApp cu mesajul deja compus — omul apasă trimite
 * și ajunge chiar la Vlad.
 *
 * Când apare un backend, se schimbă doar `handleSubmit`: validarea și textul
 * stau deja separate, în `src/lib/lead.ts`.
 */
export function LeadForm() {
  const [errors, setErrors] = useState<LeadErrors>({});
  const [sentTo, setSentTo] = useState<string | null>(null);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const data = new FormData(event.currentTarget);
    const values: LeadValues = {
      name: String(data.get("name") ?? ""),
      phone: String(data.get("phone") ?? ""),
      email: String(data.get("email") ?? ""),
      message: String(data.get("message") ?? ""),
      consent: data.get("consent") === "on",
    };

    const found = validateLead(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    const link = buildWhatsappLink(site.contact.whatsapp, values);
    setSentTo(link);
    // Dacă browserul blochează fereastra, linkul rămâne vizibil mai jos.
    window.open(link, "_blank", "noopener,noreferrer");
  };

  if (sentTo) {
    return (
      <div className="border-line border-t py-16">
        <p className="display-sm max-w-[26ch]">Ți-am deschis WhatsApp cu mesajul scris.</p>
        <p className="text-muted mt-4 max-w-[42ch] text-sm">
          Apasă trimite acolo și ajunge direct la Vlad. Dacă nu s-a deschis nimic, folosește linkul
          de mai jos.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <a
            href={sentTo}
            target="_blank"
            rel="noreferrer"
            className="bg-ink text-paper px-7 py-4 text-sm transition-opacity duration-300 hover:opacity-85"
          >
            Deschide WhatsApp
          </a>
          <button
            type="button"
            onClick={() => setSentTo(null)}
            className="border-ink text-ink btn-sweep hover:text-paper border px-7 py-4 text-sm transition-colors duration-500"
          >
            Înapoi la formular
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="border-line border-t">
      <Field name="name" label="Nume" error={errors.name} autoComplete="name" />
      <Field name="phone" label="Telefon" type="tel" error={errors.phone} autoComplete="tel" />
      <Field name="email" label="Email (opțional)" type="email" autoComplete="email" />

      <div className="border-line border-b py-5">
        <label htmlFor="message" className="eyebrow block">
          Ce cauți
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Ex: caut 3 camere în Crângași sau Militari, buget până în 100.000 EUR. Sau: hală 400—600 mp cu acces TIR, undeva pe centura de vest."
          className="placeholder:text-muted/60 mt-3 w-full resize-none bg-transparent text-[1.0625rem] outline-none"
        />
        {errors.message && <p className="text-bronze mt-2 text-xs">{errors.message}</p>}
      </div>

      <div className="border-line border-b py-5">
        <label className="flex cursor-pointer items-start gap-3 text-sm">
          <input type="checkbox" name="consent" className="accent-bronze mt-1" />
          <span className="text-ink-soft">
            Sunt de acord să fiu contactat cu privire la solicitarea mea. Datele nu sunt transmise
            nimănui altcuiva.
          </span>
        </label>
        {errors.consent && <p className="text-bronze mt-2 text-xs">{errors.consent}</p>}
      </div>

      <button
        type="submit"
        className="bg-ink text-paper hover:bg-bronze mt-8 w-full px-8 py-4 text-sm transition-colors duration-300 sm:w-auto"
      >
        Trimite pe WhatsApp
      </button>
      <p className="text-muted mt-4 text-xs">
        Se deschide WhatsApp cu mesajul deja scris. Nimic nu pleacă fără să apeși tu trimite.
      </p>
    </form>
  );
}

function Field({
  name,
  label,
  type = "text",
  error,
  ...rest
}: {
  name: string;
  label: string;
  type?: string;
  error?: string;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div className="border-line border-b py-5">
      <label htmlFor={name} className="eyebrow block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={error ? true : undefined}
        className="mt-3 w-full bg-transparent text-[1.0625rem] outline-none"
        {...rest}
      />
      {error && <p className="text-bronze mt-2 text-xs">{error}</p>}
    </div>
  );
}
