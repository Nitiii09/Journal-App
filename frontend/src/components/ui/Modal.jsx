import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { backdropVariants, modalVariants } from "../../animations/modalAnimations";

const WIDTHS = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export default function Modal({
  open,
  onClose,
  title,
  eyebrow,
  children,
  footer,
  size = "md",
  closeOnBackdrop = true,
}) {
  const panelRef = useRef(null);

  // Escape to dismiss + lock the page behind the modal.
  useEffect(() => {
    if (!open) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);

    // Move focus into the dialog so the keyboard doesn't stay behind it.
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-5">
          <motion.div
            variants={backdropVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={closeOnBackdrop ? onClose : undefined}
            className="absolute inset-0 bg-on-surface/40 frost"
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            variants={modalVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={`relative w-full ${WIDTHS[size] ?? WIDTHS.md} paper grain-panel outline-none`}
          >

            <div className="relative z-10 flex items-start justify-between gap-4 border-b border-outline-variant/60 px-7 py-5">
              <div>
                {eyebrow && (
                  <p className="label-caps mb-1 text-primary">{eyebrow}</p>
                )}
                {title && (
                  <h2 className="font-display text-xl font-bold tracking-tight">
                    {title}
                  </h2>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 -mt-1 p-1.5 text-on-surface-variant transition-colors hover:text-primary"
              >
                <X className="h-5 w-5" strokeWidth={2.4} />
              </button>
            </div>

            <div className="relative z-10 px-7 py-6">{children}</div>

            {footer && (
              <div className="relative z-10 flex flex-wrap justify-end gap-3 border-t border-outline-variant/60 px-7 py-5">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
