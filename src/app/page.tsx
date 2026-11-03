import { sampleContacts } from "@/data/sample-contacts";

export default function Home() {
  return (
    <main>
      <h1>Contacts</h1>
      <ul>
        {sampleContacts.map((contact) => (
          <li key={contact.name}>
            <strong>{contact.name}</strong> — {contact.company}
            <br />
            {contact.notes}
            <br />
            Last contacted: {contact.lastContacted}
          </li>
        ))}
      </ul>
    </main>
  );
}
