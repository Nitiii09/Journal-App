import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, User, Check, X, Loader2, Sparkles } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import useAuth from "../../hooks/useAuth";
import useUsernameCheck from "../../hooks/useUsernameCheck";

const MIN_USERNAME = 3;

/** Spinner / tick / cross shown inside the username field. */
function StatusMark({ status }) {
  if (status === "checking") {
    return <Loader2 className="h-4 w-4 animate-spin text-on-surface-variant/60" />;
  }
  if (status === "available") {
    return (
      <motion.span
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="grid h-5 w-5 place-items-center bg-tertiary text-on-primary"
      >
        <Check className="h-3 w-3" strokeWidth={3.4} />
      </motion.span>
    );
  }
  if (status === "taken" || status === "invalid") {
    return (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 500, damping: 20 }}
        className="grid h-5 w-5 place-items-center bg-error text-on-primary"
      >
        <X className="h-3 w-3" strokeWidth={3.4} />
      </motion.span>
    );
  }
  return null;
}

export default function Signup() {
  const navigate = useNavigate();
  const { signup, busy } = useAuth();

  const [form, setForm] = useState({ username: "", password: "", confirm: "" });
  const [errors, setErrors] = useState({});

  const { status, message, suggestions } = useUsernameCheck(form.username, {
    minLength: MIN_USERNAME,
  });

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const pickSuggestion = (name) => {
    setForm((prev) => ({ ...prev, username: name }));
    setErrors((prev) => ({ ...prev, username: undefined, form: undefined }));
  };

  const validate = () => {
    const next = {};
    const username = form.username.trim();

    if (!username) next.username = "Pick a username.";
    else if (username.length < MIN_USERNAME)
      next.username = `At least ${MIN_USERNAME} characters.`;
    else if (status === "taken") next.username = "That username is already taken.";
    else if (status === "invalid") next.username = message;

    if (!form.password) next.password = "Choose a password.";
    else if (form.password.length < 6)
      next.password = "At least 6 characters — the server requires it.";

    if (form.confirm !== form.password) next.confirm = "These don't match.";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const user = await signup({
        username: form.username.trim(),
        password: form.password,
      });
      toast.success("Your journal is open.", `Welcome, @${user.username}`);
      navigate("/", { replace: true });
    } catch (error) {
      // 409 means someone claimed the name between the check and the submit.
      if (error.status === 409) {
        setErrors({ username: "That username was just taken. Try another." });
      } else {
        setErrors({ form: error.message ?? "Could not create your account." });
      }
    }
  };

  // Don't let people submit a name we already know is unusable.
  const blocked = status === "taken" || status === "invalid" || status === "checking";

  return (
    <AuthShell
      headline={
        <>
          Start a page{" "}
          <span className="relative inline-block text-primary">
            nobody
            <span className="absolute -bottom-1 left-0 h-1 w-full bg-primary/25" />
          </span>{" "}
          has written yet.
        </>
      }
      subline="One entry a day. Write yours, and your friends' days open up."
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="label-caps mb-1.5 text-primary">New account</p>
        <div className="mb-8 h-px w-full bg-primary/30" />

        <div className="space-y-7">
          <div>
            <Input
              label="Username"
              icon={User}
              value={form.username}
              onChange={update("username")}
              error={
                errors.username ||
                (status === "taken" || status === "invalid" ? message : undefined)
              }
              success={status === "available" ? "That one's free." : undefined}
              hint={
                status === "idle" && !form.username
                  ? "This is the only name Daymark stores."
                  : undefined
              }
              adornment={<StatusMark status={status} />}
              autoComplete="username"
              placeholder="pick a username"
              maxLength={20}
              autoFocus
            />

            {/* Alternatives, offered only while the name is actually taken.
                Rendered conditionally rather than through AnimatePresence —
                a stalled exit would leave suggestions on screen after the
                user has already picked a free name. */}
            {status === "taken" && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 border-l-2 border-tertiary bg-tertiary-fixed/40 px-4 py-3">
                    <p className="label-caps mb-2.5 flex items-center gap-1.5 text-tertiary">
                      <Sparkles className="h-3 w-3" strokeWidth={2.8} />
                      These are free
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((name, i) => (
                        <motion.button
                          key={name}
                          type="button"
                          onClick={() => pickSuggestion(name)}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05, duration: 0.25 }}
                          whileTap={{ scale: 0.96 }}
                          className="border border-outline-variant bg-surface-lowest px-2.5 py-1.5 font-display text-[11px] font-bold tracking-tight transition-colors hover:border-primary hover:text-primary"
                        >
                          {name}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
          </div>

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
            autoComplete="new-password"
            placeholder="at least 6 characters"
          />

          <Input
            label="Confirm password"
            type="password"
            value={form.confirm}
            onChange={update("confirm")}
            error={errors.confirm}
            autoComplete="new-password"
            placeholder="type it again"
          />
        </div>

        {errors.form && (
          <p className="mt-6 border-l-2 border-error bg-error-container/40 px-4 py-3 font-annotation text-xs text-error">
            {errors.form}
          </p>
        )}

        <div className="mt-9 space-y-3.5">
          <Button
            type="submit"
            loading={busy}
            disabled={blocked}
            iconRight={ArrowRight}
            className="w-full"
            size="lg"
          >
            Create account
          </Button>

          <Button as={Link} to="/login" variant="outline" className="w-full">
            I already have one
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}
