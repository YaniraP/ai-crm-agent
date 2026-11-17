import Form from "next/form";
import Link from "next/link";

// GET form: submitting navigates to /?q=<text>, so the search lives in the URL
// (reload, back button and shared links keep it). next/form does this as a
// client-side navigation, without reloading the whole page.
export function SearchForm({ q }: { q: string }) {
  return (
    <Form action="/" role="search">
      <label htmlFor="contact-search">Search by name or company</label>
      <br />
      {/* key={q}: defaultValue only applies on mount, so remount the input
          when the URL changes (e.g. after Clear) to show the current search. */}
      <input
        key={q}
        id="contact-search"
        name="q"
        type="search"
        defaultValue={q}
        maxLength={100}
        placeholder="e.g. ana"
      />{" "}
      <button type="submit">Search</button>
      {q ? (
        <>
          {" "}
          <Link href="/">Clear</Link>
        </>
      ) : null}
    </Form>
  );
}
