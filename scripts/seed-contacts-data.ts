import type { Contact } from "@/types/contact";

// Seed-only data. Fixed ids (24-hex strings) are the seed's unique key:
// re-running the seed upserts on _id, so it never creates duplicates.
export const seedContacts: Contact[] = [
  {
    id: "000000000000000000000001",
    name: "Alice Johnson",
    company: "Northwind Traders",
    notes: "Interested in the enterprise plan, follow up after Q4 budget review.",
    lastContacted: "2026-10-15",
  },
  {
    id: "000000000000000000000002",
    name: "Bruno Santos",
    company: "Lumen Logistics",
    notes: "Asked for a demo of the reporting dashboard.",
    lastContacted: "2026-10-22",
  },
  {
    id: "000000000000000000000003",
    name: "Chidi Okafor",
    company: "Greenfield Analytics",
    notes: "Renewal due next month, check in before contract expires.",
    lastContacted: "2026-10-28",
  },
];
