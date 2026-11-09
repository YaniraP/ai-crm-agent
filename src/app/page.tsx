import { Suspense } from "react";
import { getContacts } from "@/lib/contacts";

async function ContactList() {
  const contacts = await getContacts();

  if (contacts.length === 0) {
    return <p>No contacts yet.</p>;
  }

  return (
    <ul>
      {contacts.map((contact) => (
        <li key={contact.id}>
          <strong>{contact.name}</strong> — {contact.company}
          <br />
          {contact.notes}
          <br />
          Last contacted: {contact.lastContacted}
        </li>
      ))}
    </ul>
  );
}

export default function Home() {
  return (
    <main>
      <h1>Contacts</h1>
      <Suspense fallback={<p>Loading contacts…</p>}>
        <ContactList />
      </Suspense>
    </main>
  );
}
