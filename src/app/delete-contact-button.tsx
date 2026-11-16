"use client";

import { useActionState, type FormEvent } from "react";
import { deleteContactAction, type DeleteContactState } from "./actions";

const initialState: DeleteContactState = { error: null };

export function DeleteContactButton({ id, name }: { id: string; name: string }) {
  const [state, formAction, pending] = useActionState(deleteContactAction, initialState);

  // Runs before the action. preventDefault() on Cancel stops React from
  // sending the form, so nothing reaches the server.
  function confirmDelete(event: FormEvent<HTMLFormElement>) {
    if (!window.confirm(`Delete ${name}? This cannot be undone.`)) {
      event.preventDefault();
    }
  }

  return (
    <form action={formAction} onSubmit={confirmDelete}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={pending}>
        {pending ? "Deleting…" : "Delete"}
      </button>
      {state.error ? <span role="alert"> {state.error}</span> : null}
    </form>
  );
}
