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
          <strong>{contact.name}</strong> {contact.company ? <>— {contact.company}</> : null}
          {contact.email ?
            <>
              <br />
              Email: {contact.email}</> : null}
          {contact.phone ?
            <>
              <br />
              Phone: {contact.phone}</> : null}
          <br />
          {contact.notes}
          {contact.lastContacted ?
            <>
              <br />
              Last contacted: {contact.lastContacted}</> : null}
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
