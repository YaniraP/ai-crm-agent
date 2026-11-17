"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useId, useState } from "react";
import type { Contact } from "@/types/contact";
import {
  createContactAction,
  updateContactAction,
  type ContactFormState,
  type ContactFormValues,
} from "./actions";

const SUCCESS_MESSAGE_MS = 3000;

const EMPTY_VALUES: ContactFormValues = {
  name: "",
  company: "",
  email: "",
  phone: "",
  lastContacted: "",
  notes: "",
};

// Form fields are strings: a NULL column shows as an empty input.
function toFormValues(contact: Contact): ContactFormValues {
  return {
    name: contact.name,
    company: contact.company ?? "",
    email: contact.email ?? "",
    phone: contact.phone ?? "",
    lastContacted: contact.lastContacted ?? "",
    notes: contact.notes,
  };
}

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert">
      {message}
    </p>
  ) : null;
}

type ContactFormProps = {
  contact?: Contact; // given → edit this contact; missing → add a new one
  onDone?: () => void; // called after a successful save
};

export function ContactForm({ contact, onDone }: ContactFormProps) {
  const isEdit = contact !== undefined;
  const [state, formAction, pending] = useActionState(
    isEdit ? updateContactAction : createContactAction,
    {
      status: "idle",
      errors: {},
      values: isEdit ? toFormValues(contact) : EMPTY_VALUES,
    } satisfies ContactFormState,
  );
  const { errors, values } = state;

  // Several forms can be on the page at once (add + edits), so every
  // id must be unique or the labels point to the wrong inputs.
  const uid = useId();
  const fieldId = (field: string) => `${uid}-${field}`;

  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      onDone?.();
    } else if (state.status === "not-found") {
      // alert() waits for OK; then the refreshed list no longer has this contact,
      // so this form disappears with it.
      window.alert("This contact no longer exists.");
      router.refresh();
    }
  }, [state, onDone, router]);

  // "Contact added." hides after 4 s. Each submit returns a new state object,
  // so remembering which state was hidden makes the next success show again.
  const [hiddenState, setHiddenState] = useState<ContactFormState | null>(null);
  const showAdded = !isEdit && state.status === "success" && hiddenState !== state;

  useEffect(() => {
    if (!showAdded) return;
    const timer = setTimeout(() => setHiddenState(state), SUCCESS_MESSAGE_MS);
    // Runs on unmount (or a new submit): no timer fires on a gone component.
    return () => clearTimeout(timer);
  }, [showAdded, state]);

  // React resets the form after every submit. defaultValue puts back what was
  // typed when the action returns an error (and clears it after an add).
  return (
    <form action={formAction}>
      {isEdit ? <input type="hidden" name="id" value={contact.id} /> : null}

      <div>
        <label htmlFor={fieldId("name")}>Name *</label>
        <br />
        <input
          id={fieldId("name")}
          name="name"
          required
          defaultValue={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? fieldId("name-error") : undefined}
        />
        <FieldError id={fieldId("name-error")} message={errors.name} />
      </div>

      <div>
        <label htmlFor={fieldId("company")}>Company</label>
        <br />
        <input id={fieldId("company")} name="company" defaultValue={values.company} />
      </div>

      <div>
        <label htmlFor={fieldId("email")}>Email</label>
        <br />
        <input
          id={fieldId("email")}
          name="email"
          type="email"
          defaultValue={values.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? fieldId("email-error") : undefined}
        />
        <FieldError id={fieldId("email-error")} message={errors.email} />
      </div>

      <div>
        <label htmlFor={fieldId("phone")}>Phone</label>
        <br />
        <input
          id={fieldId("phone")}
          name="phone"
          type="tel"
          defaultValue={values.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? fieldId("phone-error") : undefined}
        />
        <FieldError id={fieldId("phone-error")} message={errors.phone} />
      </div>

      <div>
        <label htmlFor={fieldId("lastContacted")}>Last contacted</label>
        <br />
        <input
          id={fieldId("lastContacted")}
          name="lastContacted"
          type="date"
          defaultValue={values.lastContacted}
          aria-invalid={Boolean(errors.lastContacted)}
          aria-describedby={errors.lastContacted ? fieldId("lastContacted-error") : undefined}
        />
        <FieldError id={fieldId("lastContacted-error")} message={errors.lastContacted} />
      </div>

      <div>
        <label htmlFor={fieldId("notes")}>Notes</label>
        <br />
        <textarea id={fieldId("notes")} name="notes" rows={3} defaultValue={values.notes} />
      </div>

      <FieldError id={fieldId("form-error")} message={errors.form} />
      {/* role="status" is a polite live region: screen readers announce the
          text when it appears. It stays in the page (only its text changes)
          so the announcement isn't missed. */}
      <div role="status">{showAdded ? "Contact added." : null}</div>

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : isEdit ? "Save changes" : "Add contact"}
      </button>
    </form>
  );
}
