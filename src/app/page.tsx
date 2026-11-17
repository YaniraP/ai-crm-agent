import { Suspense } from "react";
import { getContacts } from "@/lib/contacts";
import { ContactForm } from "./contact-form";
import { DeleteContactButton } from "./delete-contact-button";
import { EditContact } from "./edit-contact";
import { SearchForm } from "./search-form";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

// ?q=a&q=b gives an array: use the first value. Missing → "".
function firstValue(value: string | string[] | undefined): string {
  return (Array.isArray(value) ? value[0] : value)?.trim() ?? "";
}

// Reads the URL at request time, so it must stay inside <Suspense>:
// everything outside it (heading, add form) stays in the static shell.
async function ContactSearch({ searchParams }: { searchParams: SearchParams }) {
  const q = firstValue((await searchParams).q);

  return (
    <>
      <SearchForm q={q} />
      {/* key={q}: a new search is a new boundary, so "Searching…" shows
          while the results load instead of the old list. */}
      <Suspense key={q} fallback={<p>Searching…</p>}>
        <ContactList q={q} />
      </Suspense>
    </>
  );
}

async function ContactList({ q }: { q: string }) {
  const contacts = await getContacts(q);

  if (contacts.length === 0) {
    return <p>{q ? `No contacts match "${q}".` : "No contacts yet."}</p>;
  }

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact.id}>
          <strong>{contact.name}</strong> {contact.company ? <>— {contact.company}</> : null}
          {contact.email ?
            <>
              <br />
              Email: {contact.email}</> : null}
          {contact.phone ?
            <>
              <br />
              Phone: {contact.phone}</> : null}
          {contact.notes ?
            <>
              <br />
              Notes: {contact.notes}</> : null}
          {contact.lastContacted ?
            <>
              <br />
              Last contacted: {contact.lastContacted}</> : null}
          <EditContact contact={contact} />
          <DeleteContactButton id={contact.id} name={contact.name} />
        </li>
      ))
      }
    </ul >
  );
}

export default function Home({ searchParams }: { searchParams: SearchParams }) {
  return (
    <main>
      <h1>Contacts</h1>
      <section>
        <h2>Add contact</h2>
        <ContactForm />
      </section>
      <h2>Contact list</h2>
      <Suspense fallback={<p>Loading contacts…</p>}>
        <ContactSearch searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
