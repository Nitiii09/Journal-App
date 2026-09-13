import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import Button from "../components/ui/Button";
import SunMark from "../components/ui/SunMark";
import useAuth from "../hooks/useAuth";

export default function NotFound() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-surface px-6">
      <span
        className="watermark absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[18rem] md:text-[30rem]"
        aria-hidden="true"
      >
        404
      </span>

      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 max-w-lg text-center"
      >
        <SunMark className="mx-auto mb-8 h-12 w-12 text-primary/50" />

        <p className="label-caps mb-5 text-primary">Error 404</p>

        <h1 className="font-display text-[1.9rem] font-bold uppercase leading-tight tracking-[-0.02em] md:text-4xl">
          This page
          <br />
          was never written.
        </h1>

        <p className="mx-auto mt-7 max-w-sm font-journal text-journal-body italic leading-relaxed text-on-surface-variant text-pretty">
          Nothing lives at this address. Your own pages are safe where you left them.
        </p>

        <Button
          as={Link}
          to={isAuthenticated ? "/" : "/login"}
          icon={ArrowLeft}
          size="lg"
          className="mt-10"
        >
          {isAuthenticated ? "Back to today" : "Sign in"}
        </Button>
      </motion.div>
    </div>
  );
}
