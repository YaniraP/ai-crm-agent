"use client";

import { useCallback, useState } from "react";
import type { Contact } from "@/types/contact";
import { ContactForm } from "./contact-form";

export function EditContact({ contact }: { contact: Contact }) {
  const [editing, setEditing] = useState(false);
  // Stable function, so the form's effect doesn't re-run on every render.
  const close = useCallback(() => setEditing(false), []);

  if (!editing) {
    return (
      <button type="button" onClick={() => setEditing(true)}>
        Edit
      </button>
    );
  }

  return (
    <div>
      <ContactForm contact={contact} onDone={close} />
      <button type="button" onClick={close}>
        Cancel
      </button>
    </div>
  );
}
