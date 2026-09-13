import { useCallback, useEffect, useRef, useState } from "react";
import MarkdownToolbar from "./MarkdownToolbar";
import { markdownToHtml, htmlToMarkdown } from "../../utils/markdown";

/**
 * WYSIWYG journal editor.
 *
 * The writer sees formatted text — a real heading, real bullets, real bold —
 * and never the Markdown behind it. Markdown is still what gets stored: it's
 * converted in when an entry loads and out when the parent asks for a value.
 *
 * Implemented on contenteditable with document.execCommand. That API is
 * formally deprecated but remains universally implemented, and it hands us
 * selection handling, list nesting and — importantly — a native undo stack
 * that stays correct across every edit. Rebuilding those on a custom document
 * model would be a large amount of code for the same result.
 */
export default function RichTextEditor({
  initialMarkdown = "",
  onChange,
  onDirty,
  disabled = false,
  placeholder = "Start where you are. Nobody is grading this.",
  className = "",
}) {
  const ref = useRef(null);
  const [isEmpty, setIsEmpty] = useState(!initialMarkdown.trim());

  // Which formats apply at the caret, so the toolbar can show them active.
  const [active, setActive] = useState({});

  // Load (and reload) the entry. Guarded on the incoming Markdown so typing
  // never causes a re-seed, which would fight the caret.
  const loadedFrom = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || loadedFrom.current === initialMarkdown) return;

    loadedFrom.current = initialMarkdown;
    el.innerHTML = markdownToHtml(initialMarkdown);
    setIsEmpty(!initialMarkdown.trim());
  }, [initialMarkdown]);

  const emit = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const text = el.textContent?.trim() ?? "";
    setIsEmpty(!text);
    onChange?.(htmlToMarkdown(el.innerHTML), text);
  }, [onChange]);

  /** Read back which inline/block formats are on at the caret. */
  const refreshActive = useCallback(() => {
    if (!ref.current) return;
    const block = document.queryCommandValue("formatBlock")?.toLowerCase() ?? "";

    setActive({
      bold: document.queryCommandState("bold"),
      italic: document.queryCommandState("italic"),
      ul: document.queryCommandState("insertUnorderedList"),
      ol: document.queryCommandState("insertOrderedList"),
      h1: block === "h1",
      h2: block === "h2",
      quote: block === "blockquote",
    });
  }, []);

  useEffect(() => {
    const onSelectionChange = () => {
      const el = ref.current;
      if (el && el.contains(document.getSelection()?.anchorNode ?? null)) {
        refreshActive();
      }
    };
    document.addEventListener("selectionchange", onSelectionChange);
    return () => document.removeEventListener("selectionchange", onSelectionChange);
  }, [refreshActive]);

  const exec = (command, value = null) => {
    const el = ref.current;
    if (!el || disabled) return;
    el.focus();
    document.execCommand(command, false, value);
    refreshActive();
    emit();
    onDirty?.();
  };

  /** Toggle a block format off by returning it to a paragraph. */
  const toggleBlock = (tag) => {
    const current = document.queryCommandValue("formatBlock")?.toLowerCase();
    exec("formatBlock", current === tag ? "p" : tag);
  };

  const handleAction = (id) => {
    switch (id) {
      case "bold":
        return exec("bold");
      case "italic":
        return exec("italic");
      case "code":
        // No execCommand for inline code; wrap the selection by hand.
        return wrapInlineCode();
      case "h1":
        return toggleBlock("h1");
      case "h2":
        return toggleBlock("h2");
      case "quote":
        return toggleBlock("blockquote");
      case "ul":
        return exec("insertUnorderedList");
      case "ol":
        return exec("insertOrderedList");
      case "link":
        return addLink();
      default:
        return undefined;
    }
  };

  const wrapInlineCode = () => {
    const selection = document.getSelection();
    if (!selection || selection.isCollapsed) return;

    const range = selection.getRangeAt(0);
    // Already inside <code>? Unwrap rather than nesting.
    const existing =
      range.startContainer.parentElement?.closest?.("code") ??
      range.commonAncestorContainer?.parentElement?.closest?.("code");

    if (existing) {
      const parent = existing.parentNode;
      while (existing.firstChild) parent.insertBefore(existing.firstChild, existing);
      parent.removeChild(existing);
    } else {
      const code = document.createElement("code");
      code.appendChild(range.extractContents());
      range.insertNode(code);
    }

    emit();
    onDirty?.();
  };

  const addLink = () => {
    const selection = document.getSelection();
    const hadSelection = selection && !selection.isCollapsed;

    // eslint-disable-next-line no-alert
    const url = window.prompt("Link address", "https://");
    if (!url || url === "https://") return;

    // Only http(s) and mailto — a javascript: URL here would run on click,
    // and entries are shown to friends.
    if (!/^(https?:|mailto:)/i.test(url)) return;

    if (hadSelection) exec("createLink", url);
    else exec("insertHTML", `<a href="${url}">${url}</a>`);
  };

  /**
   * Paste as plain text.
   *
   * Pasting from a web page would otherwise drop arbitrary markup — styles,
   * scripts, images — straight into the document. Plain text is also what a
   * journal wants: the writer formats it themselves.
   */
  const handlePaste = (event) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
  };

  const handleKeyDown = (event) => {
    // Ctrl/Cmd+B and +I are handled natively by contenteditable. Intercept
    // only the ones the browser has no default for.
    const mod = event.metaKey || event.ctrlKey;
    if (mod && event.key.toLowerCase() === "k") {
      event.preventDefault();
      addLink();
    }
  };

  return (
    <div className={className}>
      <MarkdownToolbar
        onAction={handleAction}
        onUndo={() => exec("undo")}
        onRedo={() => exec("redo")}
        active={active}
        disabled={disabled}
      />

      <div className="relative">
        {isEmpty && (
          <p
            className="pointer-events-none absolute left-0 top-0 font-journal text-journal-body italic text-on-surface-variant/35"
            aria-hidden="true"
          >
            {placeholder}
          </p>
        )}

        <div
          ref={ref}
          contentEditable={!disabled}
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Today's journal entry"
          spellCheck
          onInput={() => {
            emit();
            onDirty?.();
          }}
          onPaste={handlePaste}
          onKeyDown={handleKeyDown}
          onKeyUp={refreshActive}
          onMouseUp={refreshActive}
          className="rich-text w-full focus:outline-none"
          style={{ minHeight: 420 }}
        />
      </div>
    </div>
  );
}
