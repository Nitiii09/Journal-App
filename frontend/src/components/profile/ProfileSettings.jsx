import { useNavigate } from "react-router-dom";
import { LogOut, Palette, Info, ShieldCheck } from "lucide-react";
import ThemeToggle from "../ui/ThemeToggle";
import Button from "../ui/Button";
import useAuth from "../../hooks/useAuth";

function Row({ icon: Icon, title, description, children }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-5 border-b border-outline-variant/50 py-6 last:border-b-0">
      <div className="flex min-w-0 items-start gap-4">
        <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center border border-outline-variant/70 text-on-surface-variant">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </span>
        <div className="min-w-0">
          <p className="font-display text-sm font-bold tracking-tight">{title}</p>
          <p className="mt-1 max-w-md font-journal text-sm italic leading-snug text-on-surface-variant/75">
            {description}
          </p>
        </div>
      </div>

      <div className="shrink-0">{children}</div>
    </div>
  );
}

/**
 * Settings are limited to what the API actually supports. There is no
 * update-profile or change-password endpoint, so none is faked here.
 */
export default function ProfileSettings({ className = "" }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <section className={className}>
      <h2 className="mb-2 font-display text-xl font-bold uppercase tracking-tight">
        Settings
      </h2>
      <p className="mb-4 font-journal text-[15px] italic text-on-surface-variant/70">
        Small surface, on purpose.
      </p>

      <div className="paper grain-panel px-6 md:px-8">
        <Row
          icon={Palette}
          title="Appearance"
          description="Warm parchment by default, deep ink at night. Follows your system until you choose."
        >
          <div className="w-32">
            <ThemeToggle />
          </div>
        </Row>

        <Row
          icon={ShieldCheck}
          title="Who can read your entries"
          description="Public entries are visible only to friends you've accepted — and only after they've written their own day. Private entries are yours alone."
        >
          <span className="font-display text-label-caps uppercase text-on-surface-variant/50">
            Fixed
          </span>
        </Row>

        <Row
          icon={Info}
          title="One page a day"
          description="Daymark allows a single entry per calendar day, measured in IST. You can edit today's page as often as you like."
        >
          <span className="font-display text-label-caps uppercase text-on-surface-variant/50">
            IST · UTC+5:30
          </span>
        </Row>

        <Row
          icon={LogOut}
          title="Sign out"
          description="Ends this session on this device."
        >
          <Button variant="danger" size="sm" icon={LogOut} onClick={handleLogout}>
            Log out
          </Button>
        </Row>
      </div>
    </section>
  );
}
