import {
  Bold,
  Italic,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  Quote,
  Link2,
  Code,
  Undo2,
  Redo2,
} from "lucide-react";

/**
 * Formatting controls for the journal editor.
 *
 * Deliberately a thin strip of icon buttons rather than a full ribbon — the
 * writing surface is the point, and this sits above it without competing.
 *
 * Buttons use onMouseDown with preventDefault so the textarea keeps focus and
 * its selection: on a plain click the selection would collapse before the
 * handler ran, and every action would apply to an empty range.
 */

const GROUPS = [
  [
    { id: "bold", icon: Bold, label: "Bold", shortcut: "Ctrl+B" },
    { id: "italic", icon: Italic, label: "Italic", shortcut: "Ctrl+I" },
    { id: "code", icon: Code, label: "Code" },
  ],
  [
    { id: "h1", icon: Heading1, label: "Heading 1" },
    { id: "h2", icon: Heading2, label: "Heading 2" },
  ],
  [
    { id: "ul", icon: List, label: "Bullet list" },
    { id: "ol", icon: ListOrdered, label: "Numbered list" },
    { id: "quote", icon: Quote, label: "Quote" },
  ],
  [{ id: "link", icon: Link2, label: "Link", shortcut: "Ctrl+K" }],
];

function ToolButton({ icon: Icon, label, shortcut, onPress, disabled, active }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={active}
      title={shortcut ? `${label} (${shortcut})` : label}
      disabled={disabled}
      onMouseDown={(e) => {
        e.preventDefault();
        onPress();
      }}
      className={`grid h-8 w-8 shrink-0 place-items-center rounded transition-colors disabled:opacity-30 disabled:hover:bg-transparent ${
        active
          ? "bg-primary-fixed text-primary"
          : "text-on-surface-variant hover:bg-surface-container hover:text-on-surface"
      }`}
    >
      <Icon className="h-[15px] w-[15px]" strokeWidth={2.2} />
    </button>
  );
}

export default function MarkdownToolbar({
  onAction,
  onUndo,
  onRedo,
  active = {},
  disabled = false,
}) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-y border-outline-variant/60 py-1.5">
      {GROUPS.map((group, i) => (
        <div key={i} className="flex items-center gap-0.5">
          {i > 0 && (
            <span
              className="mx-1 h-5 w-px shrink-0 bg-outline-variant/60"
              aria-hidden="true"
            />
          )}
          {group.map((tool) => (
            <ToolButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              shortcut={tool.shortcut}
              // Reflects what's on at the caret, so the writer can see the
              // formatting state without reading any syntax.
              active={Boolean(active[tool.id])}
              disabled={disabled}
              onPress={() => onAction(tool.id)}
            />
          ))}
        </div>
      ))}

      <span className="mx-1 h-5 w-px shrink-0 bg-outline-variant/60" aria-hidden="true" />

      {/* Undo/redo delegate to the browser's own contenteditable stack, which
          stays correct across every edit — so there's nothing to disable. */}
      <ToolButton
        icon={Undo2}
        label="Undo"
        shortcut="Ctrl+Z"
        disabled={disabled}
        onPress={onUndo}
      />
      <ToolButton
        icon={Redo2}
        label="Redo"
        shortcut="Ctrl+Shift+Z"
        disabled={disabled}
        onPress={onRedo}
      />
    </div>
  );
}
