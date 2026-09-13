import { EASE, EASE_IN } from "./pageVariants";

export const backdropVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

/** Modal arrives like a card being placed on the table. */
export const modalVariants = {
  initial: { opacity: 0, scale: 0.94, y: 26 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.38, ease: EASE },
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 14,
    transition: { duration: 0.2, ease: EASE_IN },
  },
};

/** Mobile: sheets rise from the bottom edge. */
export const sheetVariants = {
  initial: { y: "100%" },
  animate: { y: 0, transition: { duration: 0.4, ease: EASE } },
  exit: { y: "100%", transition: { duration: 0.28, ease: EASE_IN } },
};

export const toastVariants = {
  initial: { opacity: 0, y: -18, scale: 0.95 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 420, damping: 28 },
  },
  exit: { opacity: 0, y: -12, scale: 0.96, transition: { duration: 0.2 } },
};
