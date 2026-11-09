import type { Contact } from "@/types/contact";

// Seed-only data. Fixed UUIDs are the seed's unique key: the seed inserts with
// ON CONFLICT (id) DO NOTHING, so re-running it never creates duplicates.
export const seedContacts: Contact[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "Alice Johnson",
    company: "Northwind Traders",
    notes: "Interested in the enterprise plan, follow up after Q4 budget review.",
    lastContacted: "2026-10-15",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "Bruno Santos",
    company: "Lumen Logistics",
    notes: "Asked for a demo of the reporting dashboard.",
    lastContacted: "2026-10-22",
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    name: "Chidi Okafor",
    company: "Greenfield Analytics",
    notes: "Renewal due next month, check in before contract expires.",
    lastContacted: "2026-10-28",
  },
];
