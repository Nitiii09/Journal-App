// Shared easing — a confident, slightly overshooting curve used app-wide.
export const EASE = [0.22, 1, 0.36, 1];
export const EASE_IN = [0.65, 0, 0.35, 1];

/** Route-level transition: pages lift in like a turned page. */
export const pageVariants = {
  initial: { opacity: 0, y: 18 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: EASE, when: "beforeChildren", staggerChildren: 0.06 },
  },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: EASE_IN } },
};

/** Children of a page — headline, then body, then cards. */
export const pageChild = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

/** Big display headlines rise from behind a mask. */
export const headlineVariants = {
  initial: { opacity: 0, y: "50%" },
  animate: { opacity: 1, y: "0%", transition: { duration: 0.7, ease: EASE } },
};

export const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: 12, transition: { duration: 0.2 } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const slideInLeft = {
  initial: { opacity: 0, x: -28 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, x: -16, transition: { duration: 0.2 } },
};
