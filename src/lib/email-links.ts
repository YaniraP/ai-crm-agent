// Links that open a ready-to-send draft. Nothing is sent: the user presses Send.
// Both take the same draft, so the mail app and Gmail always match.
export type EmailDraft = { to: string; subject: string; body: string };

// mailto standard (RFC 6068): percent-encode each part and use CRLF line breaks.
// encodeURIComponent turns spaces into %20; URLSearchParams would use "+",
// which many mail apps show literally.
function encodeMailtoPart(text: string): string {
  return encodeURIComponent(text.replace(/\r?\n/g, "\r\n"));
}

export function buildMailtoUrl({ to, subject, body }: EmailDraft): string {
  // Keep "@" readable: some mail apps don't decode %40 in the address.
  const address = encodeURIComponent(to).replace(/%40/g, "@");
  return `mailto:${address}?subject=${encodeMailtoPart(subject)}&body=${encodeMailtoPart(body)}`;
}

// Gmail's compose page is a normal web page, so standard query encoding
// (URLSearchParams) is right here: Gmail decodes "+" as a space.
export function buildGmailComposeUrl({ to, subject, body }: EmailDraft): string {
  const params = new URLSearchParams({ view: "cm", to, su: subject, body });
  return `https://mail.google.com/mail/?${params}`;
}
