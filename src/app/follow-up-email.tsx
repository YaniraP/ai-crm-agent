"use client";

import { useActionState, useEffect, useState } from "react";
import { generateFollowUpAction, type FollowUpState } from "./actions";

const COPIED_MESSAGE_MS = 2000;
const initialState: FollowUpState = { email: null, error: null };

type CopyResult = { ok: boolean; at: number } | null;

export function FollowUpEmail({ contactId }: { contactId: string }) {
  const [state, formAction, pending] = useActionState(generateFollowUpAction, initialState);
  const { email, error } = state;

  // Copy feedback: remember the result and hide it after 2 s.
  const [copyResult, setCopyResult] = useState<CopyResult>(null);
  useEffect(() => {
    if (!copyResult) return;
    const timer = setTimeout(() => setCopyResult(null), COPIED_MESSAGE_MS);
    return () => clearTimeout(timer); // no timer fires after unmount
  }, [copyResult]);

  async function copyEmail() {
    if (!email) return;
    try {
      await navigator.clipboard.writeText(`Subject: ${email.subject}\n\n${email.body}`);
      setCopyResult({ ok: true, at: Date.now() });
    } catch {
      // The browser can block clipboard access (permissions, insecure page).
      setCopyResult({ ok: false, at: Date.now() });
    }
  }

  return (
    <div>
      {/* The server reads the contact by this id; nothing else is sent. */}
      <form action={formAction}>
        <input type="hidden" name="id" value={contactId} />
        <button type="submit" disabled={pending}>
          {pending ? "Generating…" : email ? "Generate another" : "Write follow-up email"}
        </button>
      </form>

      {error ? <p role="alert">{error}</p> : null}

      <div role="status">
        {email ? (
          <div>
            <p>
              <strong>Subject:</strong> {email.subject}
            </p>
            {/* pre-wrap keeps the email's line breaks */}
            <p style={{ whiteSpace: "pre-wrap" }}>{email.body}</p>
            <button type="button" onClick={copyEmail}>
              Copy
            </button>{" "}
            {copyResult?.ok ? "Copied!" : null}
            {copyResult && !copyResult.ok
              ? "Couldn't copy. Select the text and copy it manually."
              : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
