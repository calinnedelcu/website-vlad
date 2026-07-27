/**
 * Validarea formularului de contact + construirea mesajului de WhatsApp.
 *
 * Stă separat de componentă dinadins: când apare un backend real (email prin
 * Resend, webhook către CRM), se refolosește `validateLead` fără să atingi
 * formularul. Vezi README.
 */

export interface LeadValues {
  name: string;
  phone: string;
  email: string;
  message: string;
  consent: boolean;
}

export type LeadErrors = Partial<Record<"name" | "phone" | "message" | "consent", string>>;

export function validateLead(values: LeadValues): LeadErrors {
  const errors: LeadErrors = {};

  if (values.name.trim().length < 2) errors.name = "Scrie-mi cum te cheamă.";
  if (values.phone.replace(/\D/g, "").length < 9) {
    errors.phone = "Am nevoie de un număr valid ca să te sun.";
  }
  if (values.message.trim().length < 10) errors.message = "Spune-mi pe scurt ce cauți.";
  if (!values.consent) errors.consent = "Am nevoie de acordul tău ca să te pot contacta.";

  return errors;
}

/**
 * Compune linkul de WhatsApp cu mesajul deja scris.
 *
 * Site-ul e static, deci nu are cum să trimită el un email. În loc să ne
 * prefacem că am trimis ceva, deschidem WhatsApp cu tot ce a completat omul —
 * el apasă „trimite”, mesajul chiar ajunge, și rămâne și în conversația lui.
 * Pentru piața din România e oricum canalul pe care se răspunde cel mai repede.
 */
export function buildWhatsappLink(base: string, values: LeadValues): string {
  const lines = [
    `Bună, Vlad! Sunt ${values.name.trim()}.`,
    "",
    values.message.trim(),
    "",
    `Telefon: ${values.phone.trim()}`,
  ];

  if (values.email.trim()) lines.push(`Email: ${values.email.trim()}`);

  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}text=${encodeURIComponent(lines.join("\n"))}`;
}
