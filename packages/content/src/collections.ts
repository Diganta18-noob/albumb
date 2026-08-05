import type { Album, Tag, Certificate, Project } from "@chronicles/types";
import { seedImage } from "./images";
import { memories } from "./memories";

const createdAt = "2026-03-28T12:00:00.000Z";

/* ------------------------------------------------------------------ */
/* Albums — the folder tree the admin dashboard manages                 */
/* ------------------------------------------------------------------ */

function memoriesIn(chapter: string): string[] {
  return memories.filter((m) => m.chapter === chapter).map((m) => m.id);
}

function memoriesOf(category: string): string[] {
  return memories.filter((m) => m.category === category).map((m) => m.id);
}

export const albums: Album[] = [
  // Year roots
  { id: "al-2025", slug: "2025", name: "2025", path: "2025", description: "Where it started.", memoryIds: [], archived: false, createdAt, updatedAt: createdAt },
  { id: "al-2026", slug: "2026", name: "2026", path: "2026", description: "Where it ended.", memoryIds: [], archived: false, createdAt, updatedAt: createdAt },

  // Months
  { id: "al-2025-11", slug: "2025-november", name: "November", path: "2025/November", parentId: "al-2025", description: "First day, first whiteboard.", coverImage: seedImage("al-2025-11", { width: 800, height: 600, label: "November" }), memoryIds: memoriesIn("2025-11"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-2025-12", slug: "2025-december", name: "December", path: "2025/December", parentId: "al-2025", description: "The first lunches.", coverImage: seedImage("al-2025-12", { width: 800, height: 600, label: "December" }), memoryIds: memoriesIn("2025-12"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-2026-01", slug: "2026-january", name: "January", path: "2026/January", parentId: "al-2026", description: "The hackathon.", coverImage: seedImage("al-2026-01", { width: 800, height: 600, label: "January" }), memoryIds: memoriesIn("2026-01"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-2026-02", slug: "2026-february", name: "February", path: "2026/February", parentId: "al-2026", description: "Office and trips.", coverImage: seedImage("al-2026-02", { width: 800, height: 600, label: "February" }), memoryIds: memoriesIn("2026-02"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-2026-03", slug: "2026-march", name: "March", path: "2026/March", parentId: "al-2026", description: "Graduation and farewell.", coverImage: seedImage("al-2026-03", { width: 800, height: 600, label: "March" }), memoryIds: memoriesIn("2026-03"), archived: false, createdAt, updatedAt: createdAt },

  // Event folders
  { id: "al-events", slug: "events", name: "Events", path: "Events", description: "Cross-cutting collections.", memoryIds: [], archived: false, createdAt, updatedAt: createdAt },
  { id: "al-ev-hackathon", slug: "events-hackathon", name: "Hackathon", path: "Events/Hackathon", parentId: "al-events", coverImage: seedImage("al-ev-hackathon", { width: 800, height: 600, label: "Hackathon" }), description: "36 hours.", memoryIds: memoriesOf("hackathons"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-ev-office", slug: "events-office", name: "Office", path: "Events/Office", parentId: "al-events", coverImage: seedImage("al-ev-office", { width: 800, height: 600, label: "Office" }), description: "The real thing.", memoryIds: memoriesOf("office"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-ev-classroom", slug: "events-classroom", name: "Classroom", path: "Events/Classroom", parentId: "al-events", coverImage: seedImage("al-ev-classroom", { width: 800, height: 600, label: "Classroom" }), description: "Hall 2.", memoryIds: memoriesOf("classroom"), archived: false, createdAt, updatedAt: createdAt },
  { id: "al-ev-farewell", slug: "events-farewell", name: "Farewell", path: "Events/Farewell", parentId: "al-events", coverImage: seedImage("al-ev-farewell", { width: 800, height: 600, label: "Farewell" }), description: "The last night.", memoryIds: memoriesOf("farewell"), archived: false, createdAt, updatedAt: createdAt },
];

/* ------------------------------------------------------------------ */
/* Tags — derived from the memories so counts are never stale           */
/* ------------------------------------------------------------------ */

export const tags: Tag[] = (() => {
  const counts = new Map<string, number>();
  for (const m of memories) {
    for (const t of m.tags) counts.set(t, (counts.get(t) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({
      id: `tag-${name}`,
      slug: name,
      name: name.replace(/-/g, " "),
      count,
      createdAt,
    }));
})();

/* ------------------------------------------------------------------ */
/* Certificates                                                         */
/* ------------------------------------------------------------------ */

export const certificates: Certificate[] = [
  { id: "cert-amara", slug: "amara-backend", title: "Backend Engineering — Distinction", issuer: "Training Programme", issuedOn: "2026-03-12", description: "Awarded for outstanding backend work and 41 survived incidents.", image: seedImage("cert-amara", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-amara"], createdAt },
  { id: "cert-tobias", slug: "tobias-frontend", title: "Frontend Engineering — Distinction", issuer: "Training Programme", issuedOn: "2026-03-12", description: "For the design system and a border radius argument won with a printout.", image: seedImage("cert-tobias", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-tobias"], createdAt },
  { id: "cert-ifeoma", slug: "ifeoma-sql", title: "Advanced SQL & Analytics", issuer: "Training Programme", issuedOn: "2026-03-12", description: "Eight seconds of silence, then applause.", image: seedImage("cert-ifeoma", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-ifeoma"], createdAt },
  { id: "cert-rafael", slug: "rafael-fullstack", title: "Full Stack Engineering", issuer: "Training Programme", issuedOn: "2026-03-12", description: "Most pull request reviews. Last one out, every week.", image: seedImage("cert-rafael", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-rafael"], createdAt },
  { id: "cert-mei", slug: "mei-test-automation", title: "Test Automation", issuer: "Training Programme", issuedOn: "2026-03-12", description: "Seventeen bugs in one afternoon.", image: seedImage("cert-mei", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-mei"], createdAt },
  { id: "cert-david", slug: "david-cloud", title: "Cloud Practitioner", issuer: "Training Programme", issuedOn: "2026-03-12", description: "The loneliest victory: a deploy nobody had to watch.", image: seedImage("cert-david", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-david"], createdAt },
  { id: "cert-sofia", slug: "sofia-design", title: "Product Design", issuer: "Training Programme", issuedOn: "2026-03-12", description: "For cutting half her own deck, live, and being right.", image: seedImage("cert-sofia", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-sofia"], createdAt },
  { id: "cert-arjun", slug: "arjun-mobile", title: "Mobile Development", issuer: "Training Programme", issuedOn: "2026-03-12", description: "Shipped on a nine-year-old phone named Pluto.", image: seedImage("cert-arjun", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-arjun"], createdAt },
  { id: "cert-lucia", slug: "lucia-security", title: "Security Fundamentals", issuer: "Training Programme", issuedOn: "2026-03-12", description: "Got in through the search bar. Three times.", image: seedImage("cert-lucia", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-lucia"], createdAt },
  { id: "cert-kwame", slug: "kwame-performance", title: "Performance Engineering", issuer: "Training Programme", issuedOn: "2026-03-12", description: "27× faster. It was the N+1. It was always the N+1.", image: seedImage("cert-kwame", { width: 1000, height: 700, label: "Certificate" }), personIds: ["p-kwame"], createdAt },
  { id: "cert-cohort", slug: "cohort-completion", title: "Programme Completion — Cohort 11", issuer: "Training Programme", issuedOn: "2026-03-27", description: "Awarded to twenty-three people who arrived as strangers.", image: seedImage("cert-cohort", { width: 1000, height: 700, label: "Cohort" }), personIds: [], createdAt },
  { id: "cert-hackathon", slug: "hackathon-winners", title: "Hackathon — Winning Team", issuer: "Training Programme", issuedOn: "2026-01-17", description: "36 hours, no sleep, one demo.", image: seedImage("cert-hackathon", { width: 1000, height: 700, label: "Hackathon" }), personIds: ["p-tobias", "p-amara", "p-kwame", "p-rafael", "p-david"], createdAt },
];

/* ------------------------------------------------------------------ */
/* Projects                                                             */
/* ------------------------------------------------------------------ */

export const projects: Project[] = [
  { id: "proj-churn", slug: "the-churn", name: "The Churn", summary: "A churn-prediction dashboard that made a room go silent for eight seconds.", stack: ["Python", "PostgreSQL", "React"], image: seedImage("proj-churn", { width: 1200, height: 800, label: "The Churn" }), memoryId: "m-demo-day", personIds: ["p-ifeoma", "p-kwame"], createdAt },
  { id: "proj-atlas", slug: "atlas", name: "Atlas", summary: "The deploy pipeline that runs itself. Six weeks of evenings.", stack: ["Terraform", "GitHub Actions", "AWS"], image: seedImage("proj-atlas", { width: 1200, height: 800, label: "Atlas" }), memoryId: "m-first-deploy", personIds: ["p-david"], createdAt },
  { id: "proj-lantern", slug: "lantern", name: "Lantern", summary: "The hackathon winner. Built in 36 hours, redesigned in the last four.", stack: ["Next.js", "Node", "MongoDB"], image: seedImage("proj-lantern", { width: 1200, height: 800, label: "Lantern" }), memoryId: "m-hackathon-night", personIds: ["p-tobias", "p-amara", "p-rafael"], createdAt },
  { id: "proj-sentry", slug: "sentry", name: "Sentry", summary: "A security audit tool born from three vulnerabilities and one search bar.", stack: ["Go", "Docker"], image: seedImage("proj-sentry", { width: 1200, height: 800, label: "Sentry" }), memoryId: "m-security-review", personIds: ["p-lucia"], createdAt },
  { id: "proj-pluto", slug: "pluto", name: "Pluto", summary: "Mobile client tested on a nine-year-old Android found in a drawer.", stack: ["React Native", "TypeScript"], image: seedImage("proj-pluto", { width: 1200, height: 800, label: "Pluto" }), memoryId: "m-office-visit", personIds: ["p-arjun"], createdAt },
  { id: "proj-ledger", slug: "ledger", name: "Ledger", summary: "The project that started the schema argument that lasted eleven rounds.", stack: ["Node", "PostgreSQL", "Redis"], image: seedImage("proj-ledger", { width: 1200, height: 800, label: "Ledger" }), memoryId: "m-project-kickoff", personIds: ["p-rafael", "p-kwame", "p-mei"], createdAt },
];
