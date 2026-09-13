// false = talk to the real Express API. Flip to true to run the UI standalone
// on fixture data. Every service reads this, so the UI never changes either way.
export const USE_MOCK = false;

// Set VITE_API_URL in .env locally and in the Vercel dashboard for production.
// Include the /api suffix, e.g. https://your-service.onrender.com/api
// A trailing slash would produce "//users/all", so it is stripped here.
export const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000/api"
).replace(/\/+$/, "");

export const TOKEN_KEY = "daymark_token";
export const USER_KEY = "daymark_user";
export const THEME_KEY = "daymark_theme";

// The backend defines a "day" as midnight India Standard Time.
export const IST_OFFSET_MINUTES = 330; // UTC+5:30

export const VISIBILITY = {
  PUBLIC: "public",
  PRIVATE: "private",
};

export const REQUEST_STATUS = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

// Rotating writing prompts for the dashboard.
export const DAILY_PROMPTS = [
  "What are you leaving behind today?",
  "What did you notice that no one else did?",
  "What would you tell yourself this morning?",
  "Which moment today deserves to be kept?",
  "What are you carrying that you could set down?",
  "Who crossed your mind today, and why?",
  "What felt different about today?",
];

// Loading copy — never a bare spinner.
export const LOADING_MESSAGES = {
  journal: "Opening your journal…",
  friends: "Finding your people…",
  unlock: "Unlocking today…",
  requests: "Checking who's knocking…",
  generic: "Turning the page…",
};

export const ERROR_COPY = {
  401: {
    title: "Your session slipped away.",
    body: "Sign back in and your pages will be right where you left them.",
    action: "Sign in",
  },
  403: {
    title: "This page is not yours to read.",
    body: "Write today's entry, or ask them to accept your request first.",
    action: "Write today",
  },
  404: {
    title: "Nothing lives here.",
    body: "This page was never written, or it has drifted out of reach.",
    action: "Go back",
  },
  409: {
    title: "Today's page already exists.",
    body: "You get one page a day. Edit the one you've already written.",
    action: "Edit today",
  },
  500: {
    title: "Something went sideways.",
    body: "Your journal is safe. Try again in a moment.",
    action: "Try again",
  },
  default: {
    title: "Something went sideways.",
    body: "Your journal is safe. Try again in a moment.",
    action: "Try again",
  },
};

// Deterministic accent per user, so a friend always gets the same colour.
export const ACCENTS = ["primary", "secondary", "tertiary", "lavender", "mint"];

export function accentFor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return ACCENTS[hash % ACCENTS.length];
}
