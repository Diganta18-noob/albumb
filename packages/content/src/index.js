import { seedImage } from "./images";
import { memories } from "./memories";
const createdAt = "2026-03-28T12:00:00.000Z";
/** The five months, in order. Frame numbers span each chapter's memories. */
export const chapters = [
    {
        id: "ch-2025-11",
        yearMonth: "2025-11",
        title: "First Day",
        tagline: "Twenty-three strangers, one badge printer that jammed.",
        story: `November opened with a room full of strangers and a badge printer that refused to cooperate. We came in quiet, found seats the way animals find cover, and spent the first morning doing what every first day does: pretending we weren't nervous.

Priya's icebreaker broke the seal. Tobias knew every capital city in Europe. Sofia could fold a paper crane in forty seconds. By lunch we'd formed a group chat. By the end of the week, the coffee machine was the most important piece of infrastructure in the building.

We didn't know it yet — we had no idea — but this was the last time we'd all be strangers.`,
        coverImage: seedImage("ch-2025-11", { width: 1920, height: 1080, label: "First Day" }),
        heroMemoryId: "m-first-day",
        mood: "electric",
        createdAt,
        updatedAt: createdAt,
    },
    {
        id: "ch-2025-12",
        yearMonth: "2025-12",
        title: "The First Lunches",
        tagline: "Where the batch became a family, one Friday at a time.",
        story: `December was the month the walls came down. The Friday lunch became sacred — Rafael arriving with something warm from home, the table growing longer every week, the arguments about nothing and everything.

The project kickoff split us into teams and the teams into factions, and the factions argued about schemas and indexes the way real teams do. It was loud, and it was the best sound we'd had all month.

We learned the things no slide deck teaches: Amara's family has a restaurant. Mei bakes. Kwame once ran a marathon and called it "a scheduling problem."`,
        coverImage: seedImage("ch-2025-12", { width: 1920, height: 1080, label: "First Lunches" }),
        heroMemoryId: "m-first-team-lunch",
        mood: "joyful",
        createdAt,
        updatedAt: createdAt,
    },
    {
        id: "ch-2026-01",
        yearMonth: "2026-01",
        title: "The Hackathon",
        tagline: "Thirty-six hours, no sleep, one demo.",
        story: `January was the month we stopped being a classroom and became a foundry.

The hackathon ran thirty-six hours and nobody went home at midnight. Tobias rebuilt the UI at 1am. Amara found the bug at 3am — it was, she announced, "never the compiler." The first green build went out at 2am on a Thursday, and eleven people screamed in a silent study.

Mei broke the flagship feature in ninety seconds, then found seventeen more bugs, then built a leaderboard. Somewhere in there, the sun came up over the parking structure, and Rafael watched it, and said the thing none of us forgot.`,
        coverImage: seedImage("ch-2026-01", { width: 1920, height: 1080, label: "The Hackathon" }),
        heroMemoryId: "m-hackathon-night",
        mood: "electric",
        createdAt,
        updatedAt: createdAt,
    },
    {
        id: "ch-2026-02",
        yearMonth: "2026-02",
        title: "The Office, The Trips",
        tagline: "The real world, one escalator at a time.",
        story: `February took us out of the classroom and into the world it was preparing us for.

The office visit was our first look at the real thing — an escalator that stopped us like tourists, a badge scanner that worked, a codebase that people actually used. David called it "a good sign" and couldn't stop smiling for an hour.

Then the weekend trip: one rented van, twenty-three people, and a hillside that drained the city out of us. Sofia's critique taught us what editing means. Henrik's pencil reduced a week of architecture to three lines. And Lucía, gently, showed us how the search bar could be a door.

By the end of the month, the group chat had three hundred messages in a week. The family was complete.`,
        coverImage: seedImage("ch-2026-02", { width: 1920, height: 1080, label: "The Office" }),
        heroMemoryId: "m-weekend-trip",
        mood: "grateful",
        createdAt,
        updatedAt: createdAt,
    },
    {
        id: "ch-2026-03",
        yearMonth: "2026-03",
        title: "Farewell",
        tagline: "We arrived as strangers. We left as family.",
        story: `March was the month the good thing ended, and the month we learned it had never really been a thing at all — it had been people.

Demo Day was six projects, twelve minutes each, and one room that had stopped being a classroom and become a stage. The certificates went up on the wall. Mei's inscription read "Seventeen bugs in one afternoon."

Then the farewell. The lights came down. The playlist from the van played, Tobias's four minutes of silence included. Priya said we were never strangers to her — "from the moment the badge printer jammed, you were a batch. You were mine."

We left as family. That's the whole point of these pages.`,
        coverImage: seedImage("ch-2026-03", { width: 1920, height: 1080, label: "Farewell" }),
        heroMemoryId: "m-farewell",
        mood: "bittersweet",
        createdAt,
        updatedAt: createdAt,
    },
];
export const chaptersByMonth = new Map(chapters.map((c) => [c.yearMonth, c]));
export const chaptersInOrder = chapters;
/* ------------------------------------------------------------------ */
/* Categories                                                           */
/* ------------------------------------------------------------------ */
const CATEGORY_COVERS = {
    friends: "friends",
    mentors: "mentors",
    classroom: "classroom",
    team: "team",
    projects: "projects",
    hackathons: "hackathons",
    office: "office",
    funny: "funny",
    trips: "trips",
    graduation: "graduation",
    certificates: "certificates",
    farewell: "farewell",
};
export const categories = [
    { id: "cat-friends", slug: "friends", name: "Friends", description: "The people who made it home.", icon: "heart", accent: "brass", coverImage: seedImage(CATEGORY_COVERS.friends, { width: 1200, height: 800, label: "Friends" }), createdAt },
    { id: "cat-mentors", slug: "mentors", name: "Mentors", description: "Those who showed us the way.", icon: "compass", accent: "cyan", coverImage: seedImage(CATEGORY_COVERS.mentors, { width: 1200, height: 800, label: "Mentors" }), createdAt },
    { id: "cat-classroom", slug: "classroom", name: "Classroom", description: "Where the mornings were hardest.", icon: "book", accent: "ash", coverImage: seedImage(CATEGORY_COVERS.classroom, { width: 1200, height: 800, label: "Classroom" }), createdAt },
    { id: "cat-team", slug: "team", name: "Team Activities", description: "Chaos, choreographed.", icon: "users", accent: "brass", coverImage: seedImage(CATEGORY_COVERS.team, { width: 1200, height: 800, label: "Team" }), createdAt },
    { id: "cat-projects", slug: "projects", name: "Projects", description: "Things we built at 2am.", icon: "code", accent: "cyan", coverImage: seedImage(CATEGORY_COVERS.projects, { width: 1200, height: 800, label: "Projects" }), createdAt },
    { id: "cat-hackathons", slug: "hackathons", name: "Hackathons", description: "36 hours, no sleep, one demo.", icon: "zap", accent: "oxblood", coverImage: seedImage(CATEGORY_COVERS.hackathons, { width: 1200, height: 800, label: "Hackathons" }), createdAt },
    { id: "cat-office", slug: "office", name: "Office", description: "The everyday we miss now.", icon: "building", accent: "ash", coverImage: seedImage(CATEGORY_COVERS.office, { width: 1200, height: 800, label: "Office" }), createdAt },
    { id: "cat-funny", slug: "funny", name: "Funny Moments", description: "The frames we can't stop laughing at.", icon: "laugh", accent: "brass", coverImage: seedImage(CATEGORY_COVERS.funny, { width: 1200, height: 800, label: "Funny" }), createdAt },
    { id: "cat-trips", slug: "trips", name: "Trips", description: "Escapes that made us a family.", icon: "map", accent: "cyan", coverImage: seedImage(CATEGORY_COVERS.trips, { width: 1200, height: 800, label: "Trips" }), createdAt },
    { id: "cat-graduation", slug: "graduation", name: "Graduation", description: "The last first day.", icon: "award", accent: "brass", coverImage: seedImage(CATEGORY_COVERS.graduation, { width: 1200, height: 800, label: "Graduation" }), createdAt },
    { id: "cat-certificates", slug: "certificates", name: "Certificates", description: "Proof we were there.", icon: "scroll", accent: "cyan", coverImage: seedImage(CATEGORY_COVERS.certificates, { width: 1200, height: 800, label: "Certificates" }), createdAt },
    { id: "cat-farewell", slug: "farewell", name: "Farewell", description: "We arrived as strangers.", icon: "moon", accent: "oxblood", coverImage: seedImage(CATEGORY_COVERS.farewell, { width: 1200, height: 800, label: "Farewell" }), createdAt },
];
export const categoriesBySlug = new Map(categories.map((c) => [c.slug, c]));
export function categoryCounts() {
    const counts = {};
    for (const m of memories)
        counts[m.category] = (counts[m.category] ?? 0) + 1;
    return counts;
}
/* ------------------------------------------------------------------ */
/* Derived stats for the statistics section                             */
/* ------------------------------------------------------------------ */
export function stats() {
    const peopleCount = 10; // trainees only; mentors live in their own line
    const photos = memories.reduce((n, m) => n + m.images.length, 0);
    const certificates = 12;
    const projects = 6;
    const cities = new Set(memories.map((m) => m.location.city)).size;
    return {
        memories: memories.length,
        photos,
        people: peopleCount,
        projects,
        certificates,
        cities,
        daysTogether: 145,
    };
}
/* ------------------------------------------------------------------ */
/* Locations for the world map                                          */
/* ------------------------------------------------------------------ */
export function mapLocations() {
    return memories
        .filter((m) => m.location.lat !== undefined && m.location.lng !== undefined)
        .map((m) => ({
        id: m.id,
        name: m.location.name,
        city: m.location.city,
        country: m.location.country,
        lat: m.location.lat,
        lng: m.location.lng,
        kind: m.category === "trips" ? "trip" : "training",
        memoryIds: [m.id],
    }));
}
/* ------------------------------------------------------------------ */
/* The barrel                                                            */
/* ------------------------------------------------------------------ */
export { memories, memoriesById, memoryIdsInOrder } from "./memories";
export { people, peopleById, personName } from "./people";
export { albums, tags, certificates, projects } from "./collections";
export { seedImage, seedImages, seededInt, seededPick } from "./images";
