import axios from "axios";
import { API_URL } from "../utils/constants";
import { getToken, clearSession } from "../utils/storage";

/**
 * Single axios instance for the whole app.
 *
 * `withCredentials` is on because the backend sets an httpOnly `token` cookie
 * on login. Note that cookie is `sameSite: "lax"`, so browsers will NOT store
 * it across sites — a Vercel frontend talking to a Render backend is
 * cross-site. Auth therefore rides on the Authorization header below, which
 * works in both same-origin and cross-origin setups.
 */
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
  // Render's free tier spins the service down when idle; the first request
  // after that has to wait for a cold boot, which regularly takes 30–50s.
  // A short timeout would turn every first visit into a spurious error.
  timeout: 60000,
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Normalise every failure into the same shape so the UI can render a
 * designed error state instead of a raw axios object.
 */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status ?? 0;

    let message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Something went sideways.";

    if (error.code === "ECONNABORTED") {
      message = "The server is taking a while to wake up. Try again in a moment.";
    } else if (status === 0) {
      message = "Could not reach the server.";
    }

    // A dead token should not leave the user stranded on a protected page.
    if (status === 401) {
      clearSession();
    }

    return Promise.reject({ status, message, raw: error });
  }
);

export default api;
