import { EASE } from "./pageVariants";

/**
 * Cards behave like physical cardstock: hovering lifts them up-left and
 * deepens the hard shadow; pressing pushes them flat against the page.
 */
export const cardHover = {
  rest: { y: 0, x: 0, transition: { duration: 0.3, ease: EASE } },
  hover: { y: -6, x: -2, transition: { duration: 0.3, ease: EASE } },
  tap: { y: 0, x: 0, scale: 0.99, transition: { duration: 0.12 } },
};

/** Buttons simulate a physical press — the offset shadow collapses. */
export const pressable = {
  rest: { y: 0, x: 0 },
  hover: { y: -2, x: -1, transition: { duration: 0.2, ease: EASE } },
  tap: { y: 3, x: 3, transition: { duration: 0.08 } },
};

/** Small status dots / badges popping in. */
export const popIn = {
  initial: { scale: 0, opacity: 0 },
  animate: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 500, damping: 22 },
  },
  exit: { scale: 0, opacity: 0, transition: { duration: 0.15 } },
};

/** A card leaving the list after accept/decline — slides away and collapses. */
export const dismissCard = (direction = 1) => ({
  opacity: 0,
  x: 90 * direction,
  height: 0,
  marginBottom: 0,
  transition: { duration: 0.42, ease: EASE },
});

/** Timeline entries wipe in from the left rail. */
export const timelineItem = {
  initial: { opacity: 0, x: -22 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.55, ease: EASE } },
};
