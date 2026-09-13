import { motion } from "framer-motion";
import { pageVariants } from "../../animations/pageVariants";

/** Wraps each route so navigation reads as a page turn, not a hard cut. */
export default function PageTransition({ children, className = "" }) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={className}
    >
      {children}
    </motion.div>
  );
}
