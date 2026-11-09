"use client"; // Error boundaries must be Client Components

export default function ContactsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  // In dev this is the real message; in production Next replaces server
  // error messages with a generic one plus a digest (matches server logs).
  const message = error instanceof Error ? error.message : "Unknown error";
  const digest =
    error instanceof Error && "digest" in error ? String(error.digest) : undefined;

  return (
    <main>
      <h1>Could not load contacts</h1>
      <p>{message}</p>
      {digest && <p>Error reference: {digest}</p>}
      <button type="button" onClick={() => retry()}>
        Try again
      </button>
    </main>
  );
}
