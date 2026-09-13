import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders a journal entry's Markdown as formatted text.
 *
 * Every element is mapped explicitly rather than relying on a typography
 * plugin, so headings, quotes and lists inherit the app's own tokens —
 * Playfair for prose, coral for links, hairline rules — and work in both
 * themes without a second set of dark-mode overrides.
 *
 * Raw HTML is deliberately not enabled: react-markdown ignores it unless
 * rehype-raw is added, so entry content can't inject markup. Don't add that
 * plugin here without sanitising, since entries are shown to friends.
 */

const components = {
  h1: ({ children }) => (
    <h1 className="mb-3 mt-8 font-display text-2xl font-bold leading-tight tracking-tight first:mt-0 md:text-3xl">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-7 font-display text-xl font-bold leading-tight tracking-tight first:mt-0 md:text-2xl">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 font-display text-lg font-bold leading-tight tracking-tight first:mt-0">
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <h4 className="label-caps mb-2 mt-5 text-on-surface-variant first:mt-0">{children}</h4>
  ),

  p: ({ children }) => <p className="mb-5 last:mb-0">{children}</p>,

  strong: ({ children }) => (
    <strong className="font-semibold text-on-surface">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => (
    <del className="text-on-surface-variant/60 line-through">{children}</del>
  ),

  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      // noreferrer matters: entries are shared between friends, and without
      // it the linked page can see where the click came from.
      rel="noopener noreferrer nofollow"
      className="text-primary underline decoration-primary/40 underline-offset-[3px] transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),

  ul: ({ children }) => (
    <ul className="mb-5 ml-1 list-none space-y-2 last:mb-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-5 ml-5 list-decimal space-y-2 last:mb-0 marker:font-display marker:text-sm marker:font-bold marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ children, ...props }) => {
    // GFM task list items arrive with a checkbox child; keep those as-is
    // rather than adding the custom bullet on top.
    const isTask = props.className?.includes("task-list-item");
    if (isTask) {
      return <li className="flex items-baseline gap-2 pl-1">{children}</li>;
    }
    return (
      <li className="relative pl-5 before:absolute before:left-0 before:top-[0.7em] before:h-1.5 before:w-1.5 before:rounded-full before:bg-primary/60">
        {children}
      </li>
    );
  },
  input: ({ checked, type }) =>
    type === "checkbox" ? (
      <input
        type="checkbox"
        checked={Boolean(checked)}
        readOnly
        className="mt-1 h-3.5 w-3.5 shrink-0 rounded border-outline-variant text-primary focus:ring-0"
      />
    ) : null,

  blockquote: ({ children }) => (
    <blockquote className="mb-5 border-l-2 border-primary/50 pl-5 italic text-on-surface-variant last:mb-0">
      {children}
    </blockquote>
  ),

  code: ({ inline, children }) =>
    inline ? (
      <code className="rounded bg-surface-container px-1.5 py-0.5 font-mono text-[0.85em] text-on-surface">
        {children}
      </code>
    ) : (
      <code className="font-mono text-[0.85em]">{children}</code>
    ),
  pre: ({ children }) => (
    <pre className="mb-5 overflow-x-auto rounded-lg border border-outline-variant/60 bg-surface-container p-4 last:mb-0">
      {children}
    </pre>
  ),

  hr: () => <hr className="my-8 border-0 border-t border-outline-variant/70" />,

  // Wide tables must scroll inside themselves, not push the page sideways.
  table: ({ children }) => (
    <div className="mb-5 overflow-x-auto last:mb-0">
      <table className="w-full border-collapse text-left text-[0.92em]">{children}</table>
    </div>
  ),
  th: ({ children }) => (
    <th className="border-b border-outline-variant px-3 py-2 font-display text-label-caps-sm uppercase text-on-surface-variant">
      {children}
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b border-outline-variant/50 px-3 py-2 align-top">{children}</td>
  ),
};

export default function Markdown({ children = "", className = "" }) {
  return (
    <div
      className={`font-journal text-journal-body leading-[1.8] text-on-surface ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {children}
      </ReactMarkdown>
    </div>
  );
}
