"use server";

import { refresh } from "next/cache";
import {
  createContact,
  deleteContact,
  DuplicateEmailError,
  type NewContact,
} from "@/lib/contacts";

// What the user typed, kept as strings so the form can be refilled after an error.
export type ContactFormValues = {
  name: string;
  company: string;
  email: string;
  phone: string;
  lastContacted: string;
  notes: string;
};

export type ContactFormState = {
  status: "idle" | "success" | "error";
  errors: Partial<Record<keyof ContactFormValues | "form", string>>;
  values: ContactFormValues;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Same rule as the contacts_phone_format CHECK in the database.
const PHONE_PATTERN = /^[0-9 +()-]+$/;
const PHONE_MIN_DIGITS = 6;

function readText(formData: FormData, key: keyof ContactFormValues): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Empty input means "no value": NULL for nullable columns, DEFAULT for notes.
function emptyToNull(value: string): string | null {
  return value === "" ? null : value;
}

export async function createContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const values: ContactFormValues = {
    name: readText(formData, "name"),
    company: readText(formData, "company"),
    email: readText(formData, "email").toLowerCase(),
    phone: readText(formData, "phone"),
    lastContacted: readText(formData, "lastContacted"),
    notes: readText(formData, "notes"),
  };

  // The browser checks some of this too, but the server must never trust it.
  const errors: ContactFormState["errors"] = {};
  if (values.name === "") {
    errors.name = "Name is required.";
  }
  if (values.email !== "" && !EMAIL_PATTERN.test(values.email)) {
    errors.email = "Enter a valid email, e.g. ana@example.com.";
  }
  if (
    values.phone !== "" &&
    (!PHONE_PATTERN.test(values.phone) ||
      values.phone.replace(/\D/g, "").length < PHONE_MIN_DIGITS)
  ) {
    errors.phone = "Use only digits, spaces, +, - and ( ), with at least 6 digits.";
  }
  if (
    values.lastContacted !== "" &&
    (!DATE_PATTERN.test(values.lastContacted) || Number.isNaN(Date.parse(values.lastContacted)))
  ) {
    errors.lastContacted = "Enter a valid date.";
  }
  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  const input: NewContact = {
    name: values.name,
    company: emptyToNull(values.company),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    lastContacted: emptyToNull(values.lastContacted),
    notes: emptyToNull(values.notes),
  };

  try {
    await createContact(input);
  } catch (error) {
    if (error instanceof DuplicateEmailError) {
      return { status: "error", errors: { email: error.message }, values };
    }
    // Log only the message: never the connection string or the form data.
    console.error("createContact failed:", error instanceof Error ? error.message : error);
    return {
      status: "error",
      errors: { form: "Could not save the contact. Please try again." },
      values,
    };
  }

  refresh(); // re-render the page so the new contact appears in the list
  return {
    status: "success",
    errors: {},
    values: { name: "", company: "", email: "", phone: "", lastContacted: "", notes: "" },
  };
}

export type DeleteContactState = { error: string | null };

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function deleteContactAction(
  _prevState: DeleteContactState,
  formData: FormData,
): Promise<DeleteContactState> {
  // Server Actions can be called with any data, so check the id before using it.
  const id = formData.get("id");
  if (typeof id !== "string" || !UUID_PATTERN.test(id)) {
    return { error: "Invalid contact." };
  }

  try {
    // An already-deleted contact counts as success: the goal (it's gone) is met.
    await deleteContact(id);
  } catch (error) {
    // Log only the message: never the connection string.
    console.error("deleteContact failed:", error instanceof Error ? error.message : error);
    return { error: "Could not delete the contact. Please try again." };
  }

  refresh(); // re-render the page so the deleted contact disappears
  return { error: null };
}
