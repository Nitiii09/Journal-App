import { useEffect, useRef, useState } from "react";
import { checkUsername } from "../services/authService";
import useDebounce from "./useDebounce";

/**
 * Debounced username availability for the signup field.
 *
 * Status values:
 *   idle     — nothing typed yet, or too short to bother checking
 *   checking — a request is in flight
 *   available
 *   taken    — with `suggestions`
 *   invalid  — fails the format/length rules
 *
 * Responses are keyed to the value that produced them, so a slow reply for an
 * earlier keystroke can never overwrite the result for what's in the box now.
 */
export function useUsernameCheck(username, { minLength = 3, delay = 450 } = {}) {
  const [status, setStatus] = useState("idle");
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const debounced = useDebounce(username, delay);
  const latest = useRef("");

  // Show "checking" the moment the user types, not only after the debounce —
  // otherwise the field looks inert for half a second.
  useEffect(() => {
    const trimmed = (username ?? "").trim();
    if (trimmed.length >= minLength && trimmed !== debounced) {
      setStatus("checking");
    }
  }, [username, debounced, minLength]);

  useEffect(() => {
    const trimmed = (debounced ?? "").trim();
    latest.current = trimmed;

    if (!trimmed) {
      setStatus("idle");
      setMessage("");
      setSuggestions([]);
      return;
    }

    if (trimmed.length < minLength) {
      setStatus("invalid");
      setMessage(`At least ${minLength} characters.`);
      setSuggestions([]);
      return;
    }

    setStatus("checking");

    checkUsername(trimmed).then((result) => {
      // A newer keystroke has already superseded this response.
      if (latest.current !== trimmed) return;

      setMessage(result.message ?? "");
      setSuggestions(result.suggestions ?? []);

      if (result.available === true) setStatus("available");
      else if (result.available === null) setStatus("idle");
      else setStatus(result.reason === "taken" ? "taken" : "invalid");
    });
  }, [debounced, minLength]);

  const reset = () => {
    setStatus("idle");
    setMessage("");
    setSuggestions([]);
  };

  return { status, message, suggestions, reset };
}

export default useUsernameCheck;
