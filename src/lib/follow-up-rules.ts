// Shared by the page (to disable the button) and the Server Action (to enforce it).
// No server-only code here, so both the browser and the server can import it.

export const NO_NOTES_MESSAGE = "Add some notes to write a personal follow-up.";

// The email must mention something specific from the notes, so empty notes
// (or only spaces) can't produce a personal message.
export function hasUsableNotes(notes: string): boolean {
  return notes.trim() !== "";
}
