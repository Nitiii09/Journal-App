import { getStartOfISTDay, addISTDays } from "../utils/dateUtils";

/**
 * UI-only fixture data.
 *
 * Every shape here mirrors exactly what the Express API returns, so the day
 * this app is pointed at the real backend the components need no changes.
 * Delete this file once USE_MOCK is flipped off for good.
 */

const today = getStartOfISTDay();
const day = (offset) => addISTDays(today, offset).toISOString();

/** A timestamp `hours` before now — used for feed "2 HOURS AGO" labels. */
const hoursAgo = (hours) => new Date(Date.now() - hours * 3600 * 1000).toISOString();

export const MOCK_USER = {
  userId: "u_rahul",
  username: "rahul",
  createdAt: "2026-05-02T08:14:00.000Z",
};

export const MOCK_FRIENDS = [
  { _id: "u_maya", username: "maya", streak: 12, wroteToday: true, joinedAt: "2026-06-01T00:00:00.000Z" },
  { _id: "u_marcus_reads", username: "marcus_reads", streak: 45, wroteToday: true, joinedAt: "2026-05-11T00:00:00.000Z" },
  { _id: "u_sarah_creates", username: "sarah_creates", streak: 7, wroteToday: true, joinedAt: "2026-06-20T00:00:00.000Z" },
  { _id: "u_elena_vision", username: "elena_vision", streak: 23, wroteToday: false, joinedAt: "2026-04-18T00:00:00.000Z" },
  { _id: "u_minimal_jo", username: "minimal_jo", streak: 3, wroteToday: true, joinedAt: "2026-07-02T00:00:00.000Z" },
  { _id: "u_elijah", username: "elijah", streak: 0, wroteToday: false, joinedAt: "2026-07-29T00:00:00.000Z" },
  { _id: "u_priya_writes", username: "priya_writes", streak: 31, wroteToday: true, joinedAt: "2026-03-14T00:00:00.000Z" },
  { _id: "u_dev_notes", username: "dev_notes", streak: 5, wroteToday: false, joinedAt: "2026-07-11T00:00:00.000Z" },
];

export const MOCK_REQUESTS = [
  {
    _id: "req_1",
    status: "pending",
    createdAt: hoursAgo(5),
    senderId: { _id: "u_sarah_journals", username: "sarah_journals" },
    note: "Hoping to share some ephemeral thoughts.",
  },
  {
    _id: "req_2",
    status: "pending",
    createdAt: hoursAgo(26),
    senderId: { _id: "u_marcus_writes", username: "marcus.writes" },
    note: "Found you through the Discover feed.",
  },
  {
    _id: "req_3",
    status: "pending",
    createdAt: hoursAgo(50),
    senderId: { _id: "u_ln_quiet", username: "ln_quiet" },
    note: "We were in the same writing group last spring.",
  },
];

/** The signed-in user's own archive. Today is deliberately absent. */
export const MOCK_MY_JOURNALS = [
  {
    _id: "j_1",
    userId: MOCK_USER.userId,
    content:
      "The mist hung low over the harbour today. I took my usual walk along the pier, the seagulls screaming their usual complaints at nobody in particular. There is something about grey weather that makes the city feel like it is holding its breath. I stayed out longer than I meant to.",
    isPublic: true,
    journalDate: day(-1),
    createdAt: day(-1),
    updatedAt: day(-1),
  },
  {
    _id: "j_2",
    userId: MOCK_USER.userId,
    content:
      "Met S. at the corner cafe. We talked for hours about nothing in particular — the kind of conversation that leaves no residue except a good mood. I have been trying to notice these more instead of only recording the difficult days.",
    isPublic: true,
    journalDate: day(-2),
    createdAt: day(-2),
    updatedAt: day(-2),
  },
  {
    _id: "j_3",
    userId: MOCK_USER.userId,
    content:
      "Rewrote the same paragraph four times tonight and it is still wrong. Some days the work does not want to be done and the only honest thing to write is that it did not go well.",
    isPublic: false,
    journalDate: day(-3),
    createdAt: day(-3),
    updatedAt: day(-3),
  },
  {
    _id: "j_4",
    userId: MOCK_USER.userId,
    content:
      "Woke up at five without an alarm for no reason at all. Made coffee in the dark and watched the light arrive over the rooftops. I should do this on purpose sometime instead of by accident.",
    isPublic: true,
    journalDate: day(-4),
    createdAt: day(-4),
    updatedAt: day(-4),
  },
  {
    _id: "j_5",
    userId: MOCK_USER.userId,
    content:
      "A long call home. My mother described the garden in enough detail that I could see it. She has planted the tomatoes again despite last year. I like that about her.",
    isPublic: true,
    journalDate: day(-5),
    createdAt: day(-5),
    updatedAt: day(-5),
  },
  {
    _id: "j_6",
    userId: MOCK_USER.userId,
    content:
      "Finished the book I have been carrying around for a month. The ending was not what I wanted but it was the right one, which is a different and more annoying kind of satisfying.",
    isPublic: true,
    journalDate: day(-6),
    createdAt: day(-6),
    updatedAt: day(-6),
  },
  {
    _id: "j_7",
    userId: MOCK_USER.userId,
    content:
      "Nothing happened today and I am writing that down anyway, because the streak is the point and because a blank day is still a day I was here for.",
    isPublic: false,
    journalDate: day(-7),
    createdAt: day(-7),
    updatedAt: day(-7),
  },
  {
    _id: "j_8",
    userId: MOCK_USER.userId,
    content:
      "Walked the long way home to avoid a conversation I did not want to have. Thought about that the whole walk, which rather defeated the purpose.",
    isPublic: true,
    journalDate: day(-9),
    createdAt: day(-9),
    updatedAt: day(-9),
  },
  {
    _id: "j_9",
    userId: MOCK_USER.userId,
    content:
      "The first properly cold morning. Found the good coat at the back of the cupboard, still with a train ticket from March in the pocket.",
    isPublic: true,
    journalDate: day(-10),
    createdAt: day(-10),
    updatedAt: day(-10),
  },
  {
    _id: "j_10",
    userId: MOCK_USER.userId,
    content:
      "Tried to explain what I do for work to my nephew and failed completely. He concluded I press buttons. That is close enough and possibly more accurate than my job title.",
    isPublic: true,
    journalDate: day(-12),
    createdAt: day(-12),
    updatedAt: day(-12),
  },
];

/** Friends' public entries for today — only readable once you've written. */
export const MOCK_FRIENDS_TODAY = [
  {
    _id: "fj_1",
    userId: { _id: "u_maya", username: "maya" },
    content:
      "The coffee shop was too loud today, but the espresso was perfect. I finally finished reading 'The City We Became'. The ending felt like a chaotic symphony and I need to process it. Maybe I'll just sit here and watch the rain for a bit longer before I go back out into it.",
    isPublic: true,
    journalDate: day(0),
    createdAt: hoursAgo(2),
    updatedAt: hoursAgo(2),
  },
  {
    _id: "fj_2",
    userId: { _id: "u_marcus_reads", username: "marcus_reads" },
    content:
      "There's something profoundly anchoring about being awake before the world demands your attention. The streets are empty canvases, the air is sharp, and every thought feels deliberate rather than reactive. Stillness is the only thing we actually own.",
    isPublic: true,
    journalDate: day(0),
    createdAt: hoursAgo(5),
    updatedAt: hoursAgo(5),
  },
  {
    _id: "fj_3",
    userId: { _id: "u_sarah_creates", username: "sarah_creates" },
    content:
      "Things I noticed today: the light hitting the brick wall at 4pm. Someone carrying three baguettes and looking very proud about it. A stray cat that followed me for exactly two blocks and then lost interest entirely.",
    isPublic: true,
    journalDate: day(0),
    createdAt: hoursAgo(7),
    updatedAt: hoursAgo(6),
  },
  {
    _id: "fj_4",
    userId: { _id: "u_minimal_jo", username: "minimal_jo" },
    content: "Just breathed for ten minutes. Highly recommend. That's the whole entry.",
    isPublic: true,
    journalDate: day(0),
    createdAt: hoursAgo(1),
    updatedAt: hoursAgo(1),
  },
  {
    _id: "fj_5",
    userId: { _id: "u_priya_writes", username: "priya_writes" },
    content:
      "Break the grid. Make a mess. Start over. I redesigned the same screen six times today and the sixth one was worse than the second, so tomorrow I am going back to the second and pretending the others never happened.",
    isPublic: true,
    journalDate: day(0),
    createdAt: hoursAgo(0.2),
    updatedAt: hoursAgo(0.2),
  },
];

/** A specific friend's public archive, keyed by friendId. */
export const MOCK_FRIEND_JOURNALS = {
  u_maya: [
    {
      _id: "mj_1",
      userId: "u_maya",
      content: MOCK_FRIENDS_TODAY[0].content,
      isPublic: true,
      journalDate: day(0),
      createdAt: hoursAgo(2),
      updatedAt: hoursAgo(2),
    },
    {
      _id: "mj_2",
      userId: "u_maya",
      content:
        "Found a new spot downtown today. The ambient noise here is perfect for thinking. Sometimes I wonder if we are all just searching for the right background noise to our own internal monologues. It felt good to just sit and observe the rhythm of the street outside.",
      isPublic: true,
      journalDate: day(-1),
      createdAt: day(-1),
      updatedAt: day(-1),
    },
    {
      _id: "mj_3",
      userId: "u_maya",
      content:
        "The city looks different when you actually look up from the pavement. Took a different route home. Passed by that old bookstore I always mean to go into but never do. Next time, I promised myself.",
      isPublic: true,
      journalDate: day(-2),
      createdAt: day(-2),
      updatedAt: day(-2),
    },
    {
      _id: "mj_4",
      userId: "u_maya",
      content:
        "Repotted everything on the windowsill. Half of them were rootbound and I had no idea. A useful metaphor I am choosing not to examine any further tonight.",
      isPublic: true,
      journalDate: day(-4),
      createdAt: day(-4),
      updatedAt: day(-4),
    },
  ],
};

/** Fallback archive for friends without hand-written fixtures. */
export function fallbackFriendJournals(friendId) {
  return [
    {
      _id: `${friendId}_a`,
      userId: friendId,
      content:
        "A quiet one. Worked, walked, ate something I did not photograph. Some days do not need to be remarkable to be worth marking down.",
      isPublic: true,
      journalDate: day(-1),
      createdAt: day(-1),
      updatedAt: day(-1),
    },
    {
      _id: `${friendId}_b`,
      userId: friendId,
      content:
        "Had one of those conversations that rearranges something small in your head. Still turning it over. I will probably understand what it meant in about a week.",
      isPublic: true,
      journalDate: day(-3),
      createdAt: day(-3),
      updatedAt: day(-3),
    },
    {
      _id: `${friendId}_c`,
      userId: friendId,
      content:
        "Rain all afternoon. Stayed in and let it happen. There is a particular kind of permission that bad weather gives you.",
      isPublic: true,
      journalDate: day(-6),
      createdAt: day(-6),
      updatedAt: day(-6),
    },
  ];
}

/**
 * Discover is not backed by any endpoint yet — these are clearly-labelled
 * suggestions so the surface exists and can be wired up later.
 */
export const MOCK_DISCOVER = [
  { _id: "d_1", username: "annika_reads", streak: 61, mutuals: 3, blurb: "Writes long. Mostly about books and trains." },
  { _id: "d_2", username: "tomas.k", streak: 14, mutuals: 2, blurb: "One paragraph a day, never more." },
  { _id: "d_3", username: "quiet_hours", streak: 28, mutuals: 5, blurb: "Night entries. Very short. Very good." },
  { _id: "d_4", username: "meera_m", streak: 9, mutuals: 1, blurb: "Lists of small things noticed." },
  { _id: "d_5", username: "hal_writes", streak: 102, mutuals: 4, blurb: "Has not missed a day since March." },
  { _id: "d_6", username: "s.oro", streak: 6, mutuals: 2, blurb: "Recently started. Finding the voice." },
];

/** Simulated network latency so loading states are actually visible. */
export const delay = (ms = 480) => new Promise((resolve) => setTimeout(resolve, ms));
