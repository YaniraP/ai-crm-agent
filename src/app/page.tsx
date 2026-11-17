import { Suspense } from "react";
import { getContacts } from "@/lib/contacts";
import { ContactForm } from "./contact-form";
import { DeleteContactButton } from "./delete-contact-button";
import { EditContact } from "./edit-contact";

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

export default function Home() {
  return (
    <main>
      <h1>Contacts</h1>
      <section>
        <h2>Add contact</h2>
        <ContactForm />
      </section>
      <h2>All contacts</h2>
      <Suspense fallback={<p>Loading contacts…</p>}>
        <ContactList />
      </Suspense>
    </main>
  );
}
