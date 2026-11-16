"use client";

import { useActionState } from "react";
import { createContactAction, type ContactFormState } from "./actions";

const initialState: ContactFormState = {
  status: "idle",
  errors: {},
  values: { name: "", company: "", email: "", phone: "", lastContacted: "", notes: "" },
};

function FieldError({ id, message }: { id: string; message?: string }) {
  return message ? (
    <p id={id} role="alert">
      {message}
    </p>
  ) : null;
}

export function ContactForm() {
  const [state, formAction, pending] = useActionState(createContactAction, initialState);
  const { errors, values } = state;

  // React resets the form after every submit. defaultValue puts back what was
  // typed when the action returns an error (and clears it after a success).
  return (
    <form action={formAction}>
      <div>
        <label htmlFor="name">Name *</label>
        <br />
        <input
          id="name"
          name="name"
          required
          defaultValue={values.name}
          aria-invalid={Boolean(errors.name)}
          aria-describedby={errors.name ? "name-error" : undefined}
        />
        <FieldError id="name-error" message={errors.name} />
      </div>

      <div>
        <label htmlFor="company">Company</label>
        <br />
        <input id="company" name="company" defaultValue={values.company} />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <br />
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={values.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
        />
        <FieldError id="email-error" message={errors.email} />
      </div>

      <div>
        <label htmlFor="phone">Phone</label>
        <br />
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={values.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
        />
        <FieldError id="phone-error" message={errors.phone} />
      </div>

      <div>
        <label htmlFor="lastContacted">Last contacted</label>
        <br />
        <input
          id="lastContacted"
          name="lastContacted"
          type="date"
          defaultValue={values.lastContacted}
          aria-invalid={Boolean(errors.lastContacted)}
          aria-describedby={errors.lastContacted ? "lastContacted-error" : undefined}
        />
        <FieldError id="lastContacted-error" message={errors.lastContacted} />
      </div>

      <div>
        <label htmlFor="notes">Notes</label>
        <br />
        <textarea id="notes" name="notes" rows={3} defaultValue={values.notes} />
      </div>

      <FieldError id="form-error" message={errors.form} />
      <div aria-live="polite">{state.status === "success" ? "Contact added." : null}</div>

      <button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Add contact"}
      </button>
    </form>
  );
}
