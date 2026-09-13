import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { ArrowRight, User } from "lucide-react";
import AuthShell from "./AuthShell";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import { toast } from "../../components/ui/Toast";
import useAuth from "../../hooks/useAuth";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, busy } = useAuth();

  const [form, setForm] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }));
    setErrors((prev) => ({ ...prev, [field]: undefined, form: undefined }));
  };

  const validate = () => {
    const next = {};
    if (!form.username.trim()) next.username = "Enter your username.";
    if (!form.password) next.password = "Enter your password.";
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const user = await login({
        username: form.username.trim(),
        password: form.password,
      });
      toast.success("Welcome back.", `Signed in as @${user.username}`);
      navigate(location.state?.from?.pathname ?? "/", { replace: true });
    } catch (error) {
      setErrors({ form: error.message ?? "Could not sign you in." });
    }
  };

  return (
    <AuthShell
      headline={
        <>
          Write something{" "}
          <span className="relative inline-block text-primary">
            worth
            <span className="absolute -bottom-1 left-0 h-1 w-full bg-primary/25" />
          </span>{" "}
          remembering.
        </>
      }
      subline="Your thoughts belong somewhere permanent. Leave a mark."
    >
      <form onSubmit={handleSubmit} noValidate>
        <p className="label-caps mb-1.5 text-primary">Entrance</p>
        <div className="mb-8 h-px w-full bg-primary/30" />

        <div className="space-y-7">
          <Input
            label="Username"
            icon={User}
            value={form.username}
            onChange={update("username")}
            error={errors.username}
            autoComplete="username"
            placeholder="your username"
            autoFocus
          />

          <Input
            label="Password"
            type="password"
            value={form.password}
            onChange={update("password")}
            error={errors.password}
            autoComplete="current-password"
            placeholder="••••••••"
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
            iconRight={ArrowRight}
            className="w-full"
            size="lg"
          >
            Sign in
          </Button>

          <Button as={Link} to="/signup" variant="outline" className="w-full">
            Create account
          </Button>
        </div>

        <p className="mt-8 text-center font-journal text-sm italic text-on-surface-variant/60">
          One page a day. That&rsquo;s the whole deal.
        </p>
      </form>
    </AuthShell>
  );
}
