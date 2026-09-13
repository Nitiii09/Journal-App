import { Toaster, toast as hotToast } from "react-hot-toast";
import { Check, X, Info, Lock } from "lucide-react";

/**
 * Toasts styled as small paper slips rather than rounded pills, so they sit
 * inside the same material language as the rest of the app.
 */

const ICONS = {
  success: { Icon: Check, tone: "text-tertiary border-tertiary/40 bg-tertiary-fixed" },
  error: { Icon: X, tone: "text-error border-error/40 bg-error-container" },
  info: { Icon: Info, tone: "text-secondary border-secondary/40 bg-secondary-fixed" },
  unlock: { Icon: Lock, tone: "text-primary border-primary/40 bg-primary-fixed" },
};

function Slip({ kind = "info", title, body }) {
  const { Icon, tone } = ICONS[kind] ?? ICONS.info;

  return (
    <div className="flex items-start gap-3 border border-outline-variant/70 bg-surface-lowest px-4 py-3 shadow-paper">
      <span className={`mt-0.5 grid h-7 w-7 shrink-0 place-items-center border ${tone}`}>
        <Icon className="h-3.5 w-3.5" strokeWidth={3} />
      </span>
      <div className="min-w-0">
        <p className="label-caps text-on-surface">{title}</p>
        {body && (
          <p className="mt-1 font-journal text-sm leading-snug text-on-surface-variant">
            {body}
          </p>
        )}
      </div>
    </div>
  );
}

export const toast = {
  success: (title, body) =>
    hotToast.custom(() => <Slip kind="success" title={title} body={body} />),
  error: (title, body) =>
    hotToast.custom(() => <Slip kind="error" title={title} body={body} />),
  info: (title, body) => hotToast.custom(() => <Slip kind="info" title={title} body={body} />),
  unlock: (title, body) =>
    hotToast.custom(() => <Slip kind="unlock" title={title} body={body} />),
  dismiss: hotToast.dismiss,
};

export default function ToastHost() {
  return (
    <Toaster
      position="top-center"
      gutter={12}
      containerStyle={{ top: 24 }}
      toastOptions={{ duration: 3600 }}
    />
  );
}
