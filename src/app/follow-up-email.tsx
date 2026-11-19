"use client";

import { useActionState, useEffect, useId, useState } from "react";
import { buildGmailComposeUrl, buildMailtoUrl } from "@/lib/email-links";
import { NO_NOTES_MESSAGE } from "@/lib/follow-up-rules";
import { generateFollowUpAction, type FollowUpState } from "./actions";

const COPIED_MESSAGE_MS = 2000;
const initialState: FollowUpState = { email: null, error: null, recipient: null };

type CopyResult = { ok: boolean; at: number } | null;

type FollowUpEmailProps = {
  contactId: string;
  hasNotes: boolean; // computed on the server from the database
};

export function FollowUpEmail({ contactId, hasNotes }: FollowUpEmailProps) {
  const [state, formAction, pending] = useActionState(generateFollowUpAction, initialState);
  const { email, error, recipient } = state;
  const noEmailHintId = useId(); // unique per contact, for aria-describedby
  const noNotesHintId = useId();

  // Same recipient (from the database), subject and body for both links.
  const draft = email && recipient ? { to: recipient, subject: email.subject, body: email.body } : null;

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
        <button
          type="submit"
          disabled={pending || !hasNotes}
          aria-describedby={hasNotes ? undefined : noNotesHintId}
        >
          {pending ? "Generating…" : email ? "Generate another" : "Write follow-up email"}
        </button>
        {/* A hint, not an alert: nothing failed, the button just needs notes. */}
        {hasNotes ? null : <span id={noNotesHintId}> {NO_NOTES_MESSAGE}</span>}
      </form>

      {error ? <p role="alert">{error}</p> : null}

      <div role="status">
        {email ? (
          <div>
            <p>
              <strong>To:</strong> {recipient ?? "(no email address)"}
              <br />
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
            <p>
              {draft ? (
                <>
                  <a href={buildMailtoUrl(draft)}>Open in email app</a>{" "}
                  {/* noopener: the new tab can't control this page */}
                  <a href={buildGmailComposeUrl(draft)} target="_blank" rel="noopener noreferrer">
                    Open in Gmail
                  </a>
                </>
              ) : (
                <>
                  {/* A link can't be disabled, so show disabled buttons instead. */}
                  <button type="button" disabled aria-describedby={noEmailHintId}>
                    Open in email app
                  </button>{" "}
                  <button type="button" disabled aria-describedby={noEmailHintId}>
                    Open in Gmail
                  </button>{" "}
                  <span id={noEmailHintId}>This contact has no email address.</span>
                </>
              )}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
