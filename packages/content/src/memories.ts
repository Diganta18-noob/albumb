import type { Memory } from "@chronicles/types";
import { seedImage, seedImages } from "./images";

const createdAt = "2026-03-28T12:00:00.000Z";

/**
 * Fields every memory shares a default for stay out of the seed data itself —
 * seventeen `archived: false` lines would be noise, not information.
 */
type MemorySeed = Omit<Memory, "archived" | "comments"> &
  Partial<Pick<Memory, "archived" | "comments">>;

/**
 * The stories. Written to read like a magazine's table of contents ran into
 * a diary — specific enough to be believed, warm enough to be missed.
 */
const drafts: MemorySeed[] = [
  /* ------------------------------------------------------------------ */
  /* NOVEMBER 2025 — FIRST DAY                                            */
  /* ------------------------------------------------------------------ */
  {
    id: "m-first-day",
    slug: "first-day",
    title: "First Day",
    excerpt:
      "Twenty-three strangers in a room with a badge printer that jammed twice. We didn't know yet that this would be the family part.",
    story: `The air smelled like new carpet and printer toner. We filed in at eight-forty, one by one, looking for seats the way animals look for cover — far from the front, close to the exit, nowhere near each other.

The badge printer jammed. Twice.

Priya stood at the front and said, calmly, "This is the closest any of you will ever get to production debugging on day one." Nobody laughed yet. They were too busy checking whether anyone else had laughed first.

Then the icebreaker. Name, hometown, one useless fact. Tobias said his useless fact was that he could name every capital city in Europe in under three minutes. Sofia said hers was that she could make a paper crane in forty seconds flat. The room started to thaw somewhere around the third row.

By eleven we'd been divided into teams. By lunch we'd decided the coffee machine was the most important piece of infrastructure in the building. By four, we had a group chat. By the time we walked out, twenty-three strangers had quietly become one batch.

Somewhere in there, the badge printer — having given up on us entirely — started working again. Nobody noticed.`,
    date: "2025-11-03",
    chapter: "2025-11",
    category: "classroom",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Training coordinator",
    people: ["p-amara", "p-tobias", "p-sofia", "p-priya"],
    tags: ["first-day", "icebreaker", "orientation"],
    images: seedImages(["first-day-1", "first-day-2", "first-day-3"], { label: "First day" }),
    mood: "electric",
    weather: "clear",
    quote: "This is the closest any of you will ever get to production debugging on day one.",
    readingTimeMinutes: 4,
    favorite: true,
    frameNumber: 1,
    reactions: [{ type: "heart", count: 23 }],
    viewCount: 1240,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-whiteboard",
    slug: "the-whiteboard",
    title: "The Whiteboard",
    excerpt:
      "Priya left one problem deliberately unsolved. It took us four days. On the fifth morning, someone finished it.",
    story: `It started as a single line of text in the corner of the board, in Priya's handwriting: "Why does this query get slower every time we add an index?"

Four days. Four days of questions, printouts, and arguments. Arjun rebuilt the query. Ifeoma graphed the timings. Kwame, who had been silent for three days, walked up to the board at 9:12 on a Thursday and wrote a single sentence underneath her question.

The room went quiet in the way a room only goes quiet when something important has just happened.

Priya walked in, read the sentence, and said nothing for a full twelve seconds. Then she erased her question and wrote "DONE" where it had been, in letters two feet tall.

That answer stayed on the board until the building was renovated. Nobody ever erased it. It became a monument, of sorts — the first thing the next batch would see when they walked in.`,
    date: "2025-11-18",
    chapter: "2025-11",
    category: "classroom",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Unknown",
    people: ["p-kwame", "p-priya"],
    tags: ["whiteboard", "breakthrough", "mentor"],
    images: seedImages(["whiteboard-1", "whiteboard-2"], { label: "The whiteboard" }),
    mood: "proud",
    weather: "overcast",
    quote: "Why does this query get slower every time we add an index?",
    readingTimeMinutes: 3,
    favorite: true,
    frameNumber: 2,
    reactions: [{ type: "clap", count: 18 }],
    viewCount: 890,
    createdAt,
    updatedAt: createdAt,
  },

  /* ------------------------------------------------------------------ */
  /* DECEMBER 2025 — THE FIRST LUNCHES                                    */
  /* ------------------------------------------------------------------ */
  {
    id: "m-first-team-lunch",
    slug: "first-team-lunch",
    title: "The First Team Lunch",
    excerpt:
      "Rafael brought something from home and it disappeared in nine minutes. The tradition that followed outlived the training.",
    story: `Nobody remembers whose idea it was. Somebody said "lunch?" and somehow that became the whole plan.

We went to the place with the red awning and the sticky menus, the one that looked like it had been there since before the internet and would outlast it. Twelve of us. Two tables pushed together.

Rafael arrived with a container from home, said nothing, and set it in the middle. Pão de queijo, still warm, still perfect. It vanished in nine minutes. Rafael smiled like a man who had won something, and from that Friday on, he never once showed up empty-handed.

We discovered things over those lunches that no slide deck would ever teach us. Amara's family has a restaurant. Mei bakes. Kwame once ran a marathon and said it was "a scheduling problem." Tobias can name every capital city in Europe, which we verified, and it took him two minutes and forty-one seconds, which we also timed.

The Friday lunch became the sacred thing. The calendar event with the orange border that nobody ever declined.`,
    date: "2025-12-05",
    chapter: "2025-12",
    category: "friends",
    location: { name: "The place with the red awning", city: "Bengaluru", country: "India", lat: 12.9352, lng: 77.6245 },
    photographer: "Lucía",
    people: ["p-rafael", "p-amara", "p-mei", "p-kwame", "p-tobias", "p-lucia"],
    tags: ["lunch", "friday", "tradition"],
    images: seedImages(["team-lunch-1", "team-lunch-2", "team-lunch-3"], { label: "First team lunch" }),
    mood: "joyful",
    weather: "sunny",
    quote: "Nobody remembers whose idea it was. Somebody said 'lunch?' and that became the whole plan.",
    readingTimeMinutes: 4,
    favorite: true,
    frameNumber: 3,
    reactions: [{ type: "heart", count: 31 }, { type: "smile", count: 12 }],
    viewCount: 2100,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-project-kickoff",
    slug: "project-kickoff",
    title: "Project Kickoff",
    excerpt:
      "Six projects, twelve whiteboards, and the first real arguments. This was where the training stopped being a classroom.",
    story: `The briefs went up at nine. By nine-forty, someone had already renamed Project Delta "The Churn."

Teams formed the way teams always form — the talkers drifting to the talkers, the quiet ones orbiting the edge until someone pulled them in. David spent the morning drawing architecture diagrams on a whiteboard while the rest of us watched and nodded like we understood them. Nobody wanted to be the first to admit they didn't.

The arguments were real, and that mattered. Rafael and Kwame went eleven rounds about the database schema, both of them right, neither of them wrong. The room grew genuinely loud around 2pm, and it was the best sound we'd had all month — people who cared enough to fight.

By Friday, each team had a half-built thing and a whiteboard that looked like a bomb had gone off. The classroom smelled of marker and determination. Amara's sticky-note tally had reached six.

Somewhere in that week, without a single announcement, the training stopped being a classroom. It became a foundry.`,
    date: "2025-12-15",
    chapter: "2025-12",
    category: "projects",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Sofia",
    people: ["p-david", "p-rafael", "p-kwame", "p-amara"],
    tags: ["projects", "kickoff", "teamwork"],
    images: seedImages(["project-kickoff-1", "project-kickoff-2"], { label: "Project kickoff" }),
    mood: "electric",
    weather: "clear",
    quote: "The room grew genuinely loud around 2pm, and it was the best sound we'd had all month.",
    readingTimeMinutes: 4,
    favorite: false,
    frameNumber: 4,
    reactions: [{ type: "clap", count: 9 }],
    viewCount: 640,
    createdAt,
    updatedAt: createdAt,
  },

  /* ------------------------------------------------------------------ */
  /* JANUARY 2026 — THE HACKATHON                                         */
  /* ------------------------------------------------------------------ */
  {
    id: "m-hackathon-night",
    slug: "hackathon-night",
    title: "The Hackathon Night",
    excerpt:
      "Thirty-six hours, no sleep, one demo, and the sound of eleven keyboards at 3am. Somewhere in there we became a team.",
    story: `The clock hit midnight and nobody went home.

That's the whole story, really. Thirty-six hours, no sleep, one demo. But the details are the part you keep.

At 11pm, Tobias declared the UI "unacceptable" and rebuilt it from scratch in four hours. At 1am, Amara found the bug we'd been hunting since dinner — it was, as she announced to the room, "never the compiler." At 3am, Kwame and Rafael had the kind of quiet, patient conversation about indexes that sounds like two chess players at a tournament.

At 6am, David walked in with coffee for everyone and a single question: "Who's on watch for the merge?" The merge was his, and he had a spreadsheet.

The demo itself was four minutes. The room clapped. Tobias spent the entire time staring at his own UI, silently adjusting it in his head. Amara's sticky-note tally hit thirty-one.

We won. Two teams won, because there were two categories and we were greedy. The certificate went up on the wall. The photo of us — disheveled, beaming, eleven keyboards visible — went into the group chat with the caption "DON'T EVER LET ME DO THIS AGAIN."

Nobody meant it.`,
    date: "2026-01-16",
    chapter: "2026-01",
    category: "hackathons",
    location: { name: "Training Campus, Hall 1", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "The night shift",
    people: ["p-tobias", "p-amara", "p-kwame", "p-rafael", "p-david"],
    tags: ["hackathon", "all-nighter", "win"],
    images: seedImages(["hackathon-1", "hackathon-2", "hackathon-3", "hackathon-4"], { label: "Hackathon night" }),
    mood: "electric",
    weather: "clear",
    quote: "DON'T EVER LET ME DO THIS AGAIN. (Nobody meant it.)",
    readingTimeMinutes: 5,
    favorite: true,
    frameNumber: 5,
    reactions: [{ type: "fire", count: 44 }, { type: "heart", count: 27 }],
    viewCount: 3400,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-first-green-build",
    slug: "first-green-build",
    title: "The First Green Build",
    excerpt:
      "At 2am on a Thursday, eleven people screamed at a terminal. The build had passed. The build had finally passed.",
    story: `It had been red for nine hours.

Nine hours of "just one more fix." Nine hours of the little red dot, mocking us from the corner of the terminal. At some point around 1:30am, Amara stopped asking why and started asking what.

"Someone watch the terminal. I'm changing the last thing and I don't want to look."

The room held its breath. The terminal flickered. The little red dot flickered with it, and for one horrible second we all thought it would come back.

GREEN.

Eleven people screamed in a room that had a "SILENT STUDY — ABSOLUTE QUIET" sign on the door. Amara dropped to her knees like a footballer who'd just won a final. Kwame, the man who had been silent for days, said, "Told you. It's always the N+1."

The security guard came in. He looked at the eleven of us, at the terminal, at the sign, and said, "I'm going to pretend I didn't hear that."

He left. We kept screaming, quieter, at each other.

That build is still green somewhere. They don't let you forget it.`,
    date: "2026-01-14",
    chapter: "2026-01",
    category: "projects",
    location: { name: "Training Campus, Hall 1", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Mei",
    people: ["p-amara", "p-kwame", "p-mei"],
    tags: ["build", "2am", "victory"],
    images: seedImages(["green-build-1", "green-build-2"], { label: "First green build" }),
    mood: "proud",
    weather: "clear",
    quote: "I'm going to pretend I didn't hear that. — the night guard",
    readingTimeMinutes: 3,
    favorite: true,
    frameNumber: 6,
    reactions: [{ type: "fire", count: 38 }, { type: "clap", count: 22 }],
    viewCount: 2800,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-bug-hunt",
    slug: "bug-hunt",
    title: "The Bug Hunt",
    excerpt:
      "Mei broke the flagship feature in ninety seconds. Then she found the seventeen bugs. Then she made a leaderboard.",
    story: `Mei sat down at the demo machine, typed three things, and the flagship feature fell over.

"Found one," she said, pleasantly.

That was the start. The afternoon became a kind of sport. Mei would find a bug, write it on a sticky note, and place it on the board with the flourish of a chef plating a dish. By 4pm the board had eleven sticky notes. By 5pm, seventeen.

She made a leaderboard. It was, as she said, "for morale." It had her name at the top, which nobody objected to, because nobody else had found seventeen bugs in one afternoon.

The most beautiful part: every single one of those seventeen bugs was real. None of them were the "did you try turning it off and on again" kind. She'd read the whole codebase over the weekend, and she'd found the places where the code was lying.

Amara added a sticky note at the bottom: "Mei. Please. I have a family."

Mei's notebook, which she titled "Things That Should Not Have Worked," grew by seventeen entries that day. It was the best documentation any of us ever wrote.`,
    date: "2026-01-22",
    chapter: "2026-01",
    category: "funny",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Ifeoma",
    people: ["p-mei", "p-amara"],
    tags: ["bug", "qa", "leaderboard"],
    images: seedImages(["bug-hunt-1", "bug-hunt-2"], { label: "The bug hunt" }),
    mood: "joyful",
    weather: "partly-cloudy",
    quote: "Mei. Please. I have a family. — Amara's sticky note",
    readingTimeMinutes: 4,
    favorite: false,
    frameNumber: 7,
    reactions: [{ type: "smile", count: 19 }, { type: "heart", count: 14 }],
    viewCount: 1500,
    createdAt,
    updatedAt: createdAt,
  },

  /* ------------------------------------------------------------------ */
  /* FEBRUARY 2026 — THE OFFICE, THE TRIPS                                */
  /* ------------------------------------------------------------------ */
  {
    id: "m-office-visit",
    slug: "office-visit",
    title: "The Office Visit",
    excerpt:
      "The first time we walked into the real office. The badge scanner worked. It was, David said, 'a good sign.'",
    story: `The real office was different from the training campus in every way that mattered and a few ways that didn't.

It had an escalator. We stood at the bottom of it like tourists at a monument, all thirteen of us, waiting for someone to tell us it was allowed.

The badge scanner worked for all of us. David, who had been nervous about this for a week, said "a good sign" and then couldn't stop smiling for an hour. He'd been up late the night before, quietly rehearsing his introduction. He told me this later. He didn't need to. The smile gave it away.

A senior engineer walked us through the codebase — the real one, the one people use — and the room went quiet in that respectful way. Somewhere between the monorepo and the CI pipeline, the training became real. This was what it was all leading to.

At lunch, a manager asked Mei how she was finding it. "I broke the dashboard in five minutes," she said, with a smile that was half apology and half brag. "It was an accident. Mostly."

The escalator, by the way, is still the most impressive thing any of us saw that week.`,
    date: "2026-02-10",
    chapter: "2026-02",
    category: "office",
    location: { name: "Head Office, River Tower", city: "Bengaluru", country: "India", lat: 12.9538, lng: 77.6387 },
    photographer: "The office photographer",
    people: ["p-david", "p-mei", "p-amara"],
    tags: ["office", "field-trip", "first-time"],
    images: seedImages(["office-visit-1", "office-visit-2", "office-visit-3"], { label: "Office visit" }),
    mood: "humbled",
    weather: "sunny",
    quote: "I broke the dashboard in five minutes. It was an accident. Mostly.",
    readingTimeMinutes: 4,
    favorite: true,
    frameNumber: 8,
    reactions: [{ type: "heart", count: 22 }],
    viewCount: 1900,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-weekend-trip",
    slug: "weekend-trip",
    title: "The Weekend Trip",
    excerpt:
      "One weekend, one rented van, and twenty-three people who finally saw each other not as colleagues but as people.",
    story: `The van was a mistake. This was the general consensus, arrived at by everyone who wasn't driving, for the first three hours.

It didn't matter. Nothing about that weekend could have gone wrong enough to matter.

We drove north out of the city on a Friday evening, the windows down, a playlist that everyone had contributed one song to. Tobias contributed a song that was four minutes of mostly silence; it became the running joke of the whole trip.

The place was small, unremarkable, perfect. A hillside of wild grass, a house with too few beds and too many opinions about who was sharing. The city noise drained out of all of us over the first evening, like water out of a kettle.

On the second day, we climbed something that was technically a hill and emotionally a mountain. Lucía, who had been quiet for a week of difficult interviews, talked for an hour straight on the way up. We let her. The view from the top was good, but the view of each other, breathing hard, laughing, was better.

We were back by Sunday night. The group chat had three hundred messages. It stayed that way for a week.`,
    date: "2026-02-20",
    chapter: "2026-02",
    category: "trips",
    location: { name: "The hillside house", city: "Coorg", country: "India", lat: 12.4208, lng: 75.7397 },
    photographer: "Sofia",
    people: ["p-lucia", "p-tobias", "p-rafael", "p-sofia"],
    tags: ["trip", "weekend", "van"],
    images: seedImages(["weekend-trip-1", "weekend-trip-2", "weekend-trip-3", "weekend-trip-4"], { label: "Weekend trip" }),
    mood: "grateful",
    weather: "sunny",
    quote: "The city noise drained out of all of us over the first evening, like water out of a kettle.",
    readingTimeMinutes: 5,
    favorite: true,
    frameNumber: 9,
    reactions: [{ type: "heart", count: 35 }, { type: "smile", count: 18 }],
    viewCount: 2600,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-critique",
    slug: "critique",
    title: "The Critique",
    excerpt:
      "Sofia cut half her own presentation live, on stage. 'Make it simpler,' she said, and did. The room learned what editing means.",
    story: `The demo review was supposed to be about our work. It became a lesson about editing, delivered by a woman who had decided to demonstrate the thing she was preaching.

Sofia's project had a thirty-slide deck. She walked on stage, looked at it, and said, "This is too much." Then she began removing slides. Not hesitantly — ruthlessly, like a chef thinning a sauce. Ten slides became five. Five became three. The room watched, silent, as she cut her own work in front of everyone.

"The thing you keep," she said, when she was done, "is the thing that can't be removed. Everything else is decoration."

Priya, from the back: "How do you know what can't be removed?"

"Because removing it hurts."

The deck she kept was three slides. It was the best presentation any of us gave all year. The lesson outlived the deck: ask what hurts to remove. Keep that. Burn the rest.`,
    date: "2026-02-12",
    chapter: "2026-02",
    category: "classroom",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Rafael",
    people: ["p-sofia", "p-priya"],
    tags: ["critique", "editing", "presentation"],
    images: seedImages(["critique-1", "critique-2"], { label: "The critique" }),
    mood: "humbled",
    weather: "overcast",
    quote: "The thing you keep is the thing that can't be removed. Everything else is decoration.",
    readingTimeMinutes: 3,
    favorite: true,
    frameNumber: 10,
    reactions: [{ type: "clap", count: 21 }],
    viewCount: 1100,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-security-review",
    slug: "security-review",
    title: "The Security Review",
    excerpt:
      "Lucía got in through the search bar. The room fell silent. Then the tickets started getting filed.",
    story: `The security review was meant to be a formality. Lucía had other plans.

She started, politely, with the search bar. "I got in through the search bar," she said. "Please fix the search bar." Then she showed us how — three clicks, no tools, just the demo app's own features turned against it.

The room went quiet. Priya's pen stopped.

Lucía went on. The dashboard. The export button. The thing we'd all assumed was fine because it was ours. Three vulnerabilities, each one demonstrated with the patience of a teacher and the precision of a locksmith.

"None of this is your fault," she said, at the end, because she'd seen the look on our faces. "This is what security reviews are for. You're not supposed to find nothing."

The tickets got filed that afternoon. All of them. By the end of the week, two were already fixed, and a third had a sticky note on it — Amara's — reading "Lucía was right."

Her notebook gained a page that day. It was the first entry that wasn't a bug. It was the title of the talk she gave us, later, about why she reads the docs nobody reads.`,
    date: "2026-02-25",
    chapter: "2026-02",
    category: "mentors",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Ifeoma",
    people: ["p-lucia", "p-priya", "p-amara"],
    tags: ["security", "review", "vulnerability"],
    images: seedImages(["security-review-1", "security-review-2"], { label: "Security review" }),
    mood: "humbled",
    weather: "overcast",
    quote: "I got in through the search bar. Please fix the search bar.",
    readingTimeMinutes: 4,
    favorite: false,
    frameNumber: 11,
    reactions: [{ type: "clap", count: 17 }],
    viewCount: 980,
    createdAt,
    updatedAt: createdAt,
  },

  /* ------------------------------------------------------------------ */
  /* MARCH 2026 — GRADUATION AND FAREWELL                                 */
  /* ------------------------------------------------------------------ */
  {
    id: "m-demo-day",
    slug: "demo-day",
    title: "Demo Day",
    excerpt:
      "Six projects, twelve minutes each, one room that stopped being a classroom and became a stage.",
    story: `The projector was temperamental. Of course it was. It was the same projector that had refused to cooperate on the very first day, and it seemed determined to bookend the whole experience.

It didn't matter. Nobody remembers the projector.

Ifeoma presented her churn dashboard and the room went silent for eight seconds — the longest eight seconds of her life, she said later, until the clapping started. Rafael presented his team's work without once looking at his own notes. Tobias's UI got the kind of hush usually reserved for art galleries.

Priya watched from the back, and if you knew where to look, you could see her smiling — the way a conductor smiles at the end of a piece.

The certificates were handed out at four. Each one came with a handshake and a sentence. Mei's sentence was "Seventeen bugs in one afternoon." The room roared.

Someone put the certificates on the wall. Then someone put them in frames. Then someone took a photo of all of us holding them, and that photo is still the first thing you see when you open the group chat.

We were, in that moment, what we'd been building toward for five months. A cohort. A family. A batch.`,
    date: "2026-03-12",
    chapter: "2026-03",
    category: "graduation",
    location: { name: "Training Campus, Main Hall", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "The official photographer",
    people: ["p-ifeoma", "p-rafael", "p-tobias", "p-mei", "p-priya"],
    tags: ["demo-day", "graduation", "certificates"],
    images: seedImages(["demo-day-1", "demo-day-2", "demo-day-3"], { label: "Demo day" }),
    mood: "proud",
    weather: "sunny",
    quote: "Seventeen bugs in one afternoon. — Mei's certificate inscription",
    readingTimeMinutes: 4,
    favorite: true,
    frameNumber: 12,
    reactions: [{ type: "fire", count: 41 }, { type: "heart", count: 33 }],
    viewCount: 3100,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-farewell",
    slug: "farewell",
    title: "The Farewell",
    excerpt:
      "We arrived as strangers. We left as family. This is the part where it hits you.",
    story: `The lights came down. The music came up. And for one long, slow evening, we were just twenty-three people who didn't want to say goodbye.

The farewell was the thing we'd been dreading since January, in the quiet way you dread a good thing ending. The room was decorated, mostly by Sofia, who had refused to let a single banner be crooked. The playlist was the same one from the van — Tobias's four minutes of silence included, because by then it was tradition.

There were speeches. Amara's was about the tally of incidents that never quite reached forty-one. David's was a single slide, projected: a bar chart of how much coffee the cohort had consumed, and beneath it, in his careful handwriting, "Thank you for the best five months."

Priya spoke last. She said: "You were never twenty-three strangers to me. From the moment the badge printer jammed, you were a batch. You were mine."

There wasn't a dry eye in the room, and if you say there was, you weren't there.

The music played on. The lights came back up. We took the group photo, arms around each other, nobody willing to be the first to leave. Somebody's phone died. Somebody else said "DON'T EVER LET ME DO THIS AGAIN," and this time, everyone laughed — because everyone meant the opposite.

We left as family. That's the whole point of this website. That's why these pages exist.`,
    date: "2026-03-27",
    chapter: "2026-03",
    category: "farewell",
    location: { name: "Training Campus, Main Hall", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Everyone",
    people: ["p-priya", "p-amara", "p-david", "p-sofia", "p-rafael"],
    tags: ["farewell", "goodbye", "family"],
    images: seedImages(["farewell-1", "farewell-2", "farewell-3"], { label: "Farewell" }),
    mood: "bittersweet",
    weather: "clear",
    quote: "You were never twenty-three strangers to me. From the moment the badge printer jammed, you were mine.",
    readingTimeMinutes: 5,
    favorite: true,
    frameNumber: 13,
    reactions: [{ type: "tears", count: 29 }, { type: "heart", count: 47 }],
    viewCount: 4100,
    createdAt,
    updatedAt: createdAt,
  },

  /* ------------------------------------------------------------------ */
  /* THE QUOTES AND SCATTERED MEMORIES                                    */
  /* ------------------------------------------------------------------ */
  {
    id: "m-sunrise-parking",
    slug: "sunrise-parking",
    title: "The Sunrise Over the Parking Structure",
    excerpt:
      "Four in the morning. A laptop still compiling. Rafael watched the sun come up and said the thing nobody forgot.",
    story: `It was four in the morning and the demo was still compiling. The build was slow, the night was long, and Rafael, who had been there longest, decided he was done waiting.

He walked to the edge of the parking structure — the top floor, where nobody parks, because nobody's sure it's allowed — and watched the sky go from black to blue to something that couldn't decide.

The laptop, behind him, finally finished compiling. He didn't turn around.

"It's going to be fine," he said. To the sky, or the city, or whoever. "We're going to be fine."

We didn't know then how right he was, or how much we'd need to hear it again in March, when the good thing was ending and the city felt smaller without everyone in it.

The sun came up. The build was green. The demo went fine. And the next morning, four people who had been strangers five months earlier walked out of a parking structure together, as if they'd always known each other.`,
    date: "2026-01-20",
    chapter: "2026-01",
    category: "friends",
    location: { name: "Training Campus, Parking Structure", city: "Bengaluru", country: "India", lat: 12.9738, lng: 77.5946 },
    photographer: "Rafael",
    people: ["p-rafael"],
    tags: ["sunrise", "late-night", "the-build"],
    images: seedImages(["sunrise-parking-1"], { label: "Sunrise over parking" }),
    mood: "calm",
    weather: "clear",
    quote: "It's going to be fine. We're going to be fine.",
    readingTimeMinutes: 3,
    favorite: true,
    frameNumber: 14,
    reactions: [{ type: "heart", count: 25 }],
    viewCount: 1700,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-architecture-review",
    slug: "architecture-review",
    title: "The Architecture Review",
    excerpt:
      "Henrik spoke once, in pencil, and the diagram that had taken a week collapsed into three lines.",
    story: `The architecture review had been scheduled for forty-five minutes. It took ninety, and Henrik spoke for roughly eight of them.

The rest of the time, he drew. Pencil on paper, the way he always did — small, careful diagrams that looked like a man leaving breadcrumbs for himself. We watched. The silence was the respectful kind.

Our diagram took up a whole whiteboard. His took up a third of a page. Three boxes, two arrows, one note in the corner: "This is the whole thing. The rest is detail."

He didn't say it unkindly. He said it like a man who had spent twenty years learning what mattered and had stopped apologizing for it. Rafael asked one question — the right one — and Henrik answered it with a single line.

"Because the complexity has to live somewhere. You're just choosing where."

The next morning, the whiteboard was erased. Henrik's third of a page went into someone's notebook. It's still there. Somewhere in that notebook is the whole architecture, reduced to what it actually was, and the lesson that has been with us ever since: the complexity has to live somewhere. Choose where.`,
    date: "2026-02-03",
    chapter: "2026-02",
    category: "mentors",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Sofia",
    people: ["p-henrik", "p-rafael"],
    tags: ["architecture", "mentor", "pencil"],
    images: seedImages(["architecture-review-1"], { label: "Architecture review" }),
    mood: "humbled",
    weather: "overcast",
    quote: "The complexity has to live somewhere. You're just choosing where.",
    readingTimeMinutes: 3,
    favorite: true,
    frameNumber: 15,
    reactions: [{ type: "clap", count: 16 }],
    viewCount: 1020,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-first-deploy",
    slug: "first-deploy",
    title: "The First Deploy",
    excerpt:
      "David watched his pipeline run with nobody watching over it. Nothing broke. He called it 'the loneliest victory.'",
    story: `The pipeline was David's, from the first commit to the final green check. For six weeks he'd been building it in the evenings, test by test, the way other people build furniture — slowly, carefully, with the whole thing planned out before the first cut.

The deploy was scheduled for 10am on a Tuesday. At 9:59, he said, "I'm not going to watch."

Nobody asked why. We knew. He'd been building toward this moment since the office visit, since the day he'd stood at the bottom of the escalator, nervous about a badge scanner.

At 10:01, the phone buzzed. The pipeline had gone green. Nothing had broken. Nobody had even watched it.

He called it "the loneliest victory." Then he smiled, and the smile stayed for an hour, and we took the photo of him — finger on the green check, pretending to be calm — that lives on the wall to this day.

The pipeline is still running. It runs on a schedule now. It doesn't need anyone to watch it, which was the whole point, and which is also, he would tell you, the whole sadness of engineering: the best work is the work that no longer needs you.`,
    date: "2026-02-17",
    chapter: "2026-02",
    category: "projects",
    location: { name: "Training Campus, Hall 2", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "Lucía",
    people: ["p-david"],
    tags: ["deploy", "pipeline", "automation"],
    images: seedImages(["first-deploy-1"], { label: "First deploy" }),
    mood: "proud",
    weather: "sunny",
    quote: "The best work is the work that no longer needs you.",
    readingTimeMinutes: 3,
    favorite: true,
    frameNumber: 16,
    reactions: [{ type: "fire", count: 19 }],
    viewCount: 1300,
    createdAt,
    updatedAt: createdAt,
  },

  {
    id: "m-certificates",
    slug: "certificates",
    title: "The Certificates",
    excerpt:
      "Framed, hung, and signed by people who had become more than classmates. Proof that we were there.",
    story: `The certificates went up on the wall in March, all at once, like a colony deciding to roost.

Each one was different — different course, different achievement, different handwriting in the corner. Sofia had signed hers with a drawing. Tobias had signed his twice, because the first one was, as he said, "misaligned." Mei's certificate, we established beyond doubt, was the most earned piece of paper any of us had ever owned.

Amara's had a coffee ring on it within a week. Nobody had the heart to move it. It became part of the certificate, in the way that a scar becomes part of a hand.

The wall with the certificates is the first thing the next batch sees when they walk into the building. Priya made sure of that. She said it was "the syllabus that worked." She was right.

They're proof, the certificates. Not of what we knew — that was always the wrong way to read them. They're proof that we were there, in that room, in that year, with those people. That we showed up, and we stayed, and we finished.`,
    date: "2026-03-12",
    chapter: "2026-03",
    category: "certificates",
    location: { name: "Training Campus, Main Hall", city: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946 },
    photographer: "The official photographer",
    people: ["p-amara", "p-tobias", "p-mei"],
    tags: ["certificates", "graduation", "the-wall"],
    images: seedImages(["certificates-1", "certificates-2"], { label: "The certificates" }),
    mood: "proud",
    weather: "clear",
    quote: "Proof that we were there, in that room, in that year, with those people.",
    readingTimeMinutes: 3,
    favorite: false,
    frameNumber: 17,
    reactions: [{ type: "clap", count: 14 }, { type: "heart", count: 11 }],
    viewCount: 760,
    createdAt,
    updatedAt: createdAt,
  },
];

export const memories: Memory[] = drafts.map((d) => ({
  archived: false,
  comments: [],
  ...d,
}));

export const memoriesById = new Map(memories.map((m) => [m.id, m]));

/** Canonical order — frame numbers carve the timeline into chapters. */
export const memoryIdsInOrder = memories
  .slice()
  .sort((a, b) => (a.frameNumber ?? 0) - (b.frameNumber ?? 0))
  .map((m) => m.id);
