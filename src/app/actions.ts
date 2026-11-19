"use server";

import { refresh } from "next/cache";
import { AiRateLimitError, generateFollowUpEmail, type FollowUpEmail } from "@/lib/ai";
import {
  createContact,
  deleteContact,
  DuplicateEmailError,
  getContact,
  updateContact,
  type ContactInput,
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

type ContactFormErrors = Partial<Record<keyof ContactFormValues | "form", string>>;

export type ContactFormState = {
  // "not-found": the contact was deleted meanwhile (the client alerts and refreshes).
  status: "idle" | "success" | "error" | "not-found";
  errors: ContactFormErrors;
  values: ContactFormValues;
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
// Same rule as the contacts_phone_format CHECK in the database.
const PHONE_PATTERN = /^[0-9 +()-]+$/;
const PHONE_MIN_DIGITS = 6;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function readText(formData: FormData, key: keyof ContactFormValues): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

// Empty input means "no value": NULL for nullable columns, DEFAULT for notes.
function emptyToNull(value: string): string | null {
  return value === "" ? null : value;
}

// Server Actions can be called with any data, so check the id before using it.
function readId(formData: FormData): string | null {
  const id = formData.get("id");
  return typeof id === "string" && UUID_PATTERN.test(id) ? id : null;
}

// Shared by create and update: clean the form, validate it and build the input.
// input is null when there are errors.
function parseContactForm(formData: FormData): {
  values: ContactFormValues;
  errors: ContactFormErrors;
  input: ContactInput | null;
} {
  const values: ContactFormValues = {
    name: readText(formData, "name"),
    company: readText(formData, "company"),
    email: readText(formData, "email").toLowerCase(),
    phone: readText(formData, "phone"),
    lastContacted: readText(formData, "lastContacted"),
    notes: readText(formData, "notes"),
  };

  // The browser checks some of this too, but the server must never trust it.
  const errors: ContactFormErrors = {};
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
    return { values, errors, input: null };
  }

  const input: ContactInput = {
    name: values.name,
    company: emptyToNull(values.company),
    email: emptyToNull(values.email),
    phone: emptyToNull(values.phone),
    lastContacted: emptyToNull(values.lastContacted),
    notes: emptyToNull(values.notes),
  };
  return { values, errors, input };
}

// Shared handling of save errors for create and update.
function saveErrorState(
  error: unknown,
  values: ContactFormValues,
  label: string,
): ContactFormState {
  if (error instanceof DuplicateEmailError) {
    return { status: "error", errors: { email: error.message }, values };
  }
  // Log only the message: never the connection string or the form data.
  console.error(`${label} failed:`, error instanceof Error ? error.message : error);
  return {
    status: "error",
    errors: { form: "Could not save the contact. Please try again." },
    values,
  };
}

export async function createContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, errors, input } = parseContactForm(formData);
  if (!input) {
    return { status: "error", errors, values };
  }

  try {
    await createContact(input);
  } catch (error) {
    return saveErrorState(error, values, "createContact");
  }

  refresh(); // re-render the page so the new contact appears in the list
  return {
    status: "success",
    errors: {},
    values: { name: "", company: "", email: "", phone: "", lastContacted: "", notes: "" },
  };
}

export async function updateContactAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { values, errors, input } = parseContactForm(formData);
  const id = readId(formData);
  if (!id) {
    return { status: "error", errors: { form: "Invalid contact." }, values };
  }
  if (!input) {
    return { status: "error", errors, values };
  }

  let updated;
  try {
    updated = await updateContact(id, input);
  } catch (error) {
    return saveErrorState(error, values, "updateContact");
  }

  if (!updated) {
    // No refresh() here: the new list would remove this form before the
    // browser could show the alert. The client alerts first, then refreshes.
    return { status: "not-found", errors: {}, values };
  }

  refresh(); // re-render the page so the list shows the changes
  return { status: "success", errors: {}, values };
}

export type DeleteContactState = { error: string | null };

export async function deleteContactAction(
  _prevState: DeleteContactState,
  formData: FormData,
): Promise<DeleteContactState> {
  const id = readId(formData);
  if (!id) {
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

export type FollowUpState = {
  email: FollowUpEmail | null; // the last generated email, kept while regenerating
  error: string | null; // friendly text only, never technical details
};

export async function generateFollowUpAction(
  prevState: FollowUpState,
  formData: FormData,
): Promise<FollowUpState> {
  const id = readId(formData);
  if (!id) {
    return { email: prevState.email, error: "Invalid contact." };
  }

  try {
    // Read the contact from the database: never trust contact data from the browser.
    const contact = await getContact(id);
    if (!contact) {
      return { email: null, error: "This contact no longer exists." };
    }
    return { email: await generateFollowUpEmail(contact), error: null };
  } catch (error) {
    // Log only the error name and message: no key, no contact data.
    console.error(
      "generateFollowUp failed:",
      error instanceof Error ? `${error.name}: ${error.message}` : error,
    );
    const message =
      error instanceof AiRateLimitError
        ? "Too many requests. Wait a minute and try again."
        : "Couldn't generate the message. Please try again.";
    // Keep the previous email (if any) so a failed regenerate doesn't lose it.
    return { email: prevState.email, error: message };
  }
}
