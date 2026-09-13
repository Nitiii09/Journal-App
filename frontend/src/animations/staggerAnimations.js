import { EASE } from "./pageVariants";

/** Parent list — children reveal in sequence rather than all at once. */
export const staggerContainer = (stagger = 0.08, delay = 0) => ({
  initial: {},
  animate: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
  exit: {
    transition: { staggerChildren: 0.04, staggerDirection: -1 },
  },
});

/** Individual list item. */
export const staggerItem = {
  initial: { opacity: 0, y: 26 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

/** Journal cards drop in with a slight rotation — like dealt paper. */
export const paperDrop = {
  initial: { opacity: 0, y: 34, rotate: -1.5, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    rotate: 0,
    scale: 1,
    transition: { duration: 0.6, ease: EASE },
  },
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.22 } },
};

/** Word-by-word headline reveal. */
export const wordContainer = {
  initial: {},
  animate: { transition: { staggerChildren: 0.055 } },
};

export const wordItem = {
  initial: { opacity: 0, y: "60%", rotate: 3 },
  animate: {
    opacity: 1,
    y: "0%",
    rotate: 0,
    transition: { duration: 0.65, ease: EASE },
  },
};
