import { useEffect, useState } from "react";
import { cn } from "../utils/cn";

type HighlightRegistry = {
  set: (name: string, highlight: Highlight) => void;
  delete: (name: string) => void;
};

type CSSWithHighlights = typeof CSS & {
  highlights?: HighlightRegistry;
};

type Highlight = Set<Range>;

const HIGHLIGHT_NAME = "telc-user-highlight";

export default function HighlightTool() {
  const [active, setActive] = useState(false);
  const [color, setColor] = useState("#fde68a");
  const [ranges, setRanges] = useState<Range[]>([]);
  const [history, setHistory] = useState<Range[][]>([]);
  const [redoHistory, setRedoHistory] = useState<Range[][]>([]);

  useEffect(() => {
    const css = CSS as CSSWithHighlights;
    const registry = css.highlights;
    if (!registry) return;

    const highlight = new globalThis.Highlight(...ranges);
    registry.set(HIGHLIGHT_NAME, highlight);
    return () => {
      registry.delete(HIGHLIGHT_NAME);
    };
  }, [ranges]);

  useEffect(() => {
    document.documentElement.style.setProperty("--user-highlight-color", color);
  }, [color]);

  useEffect(() => {
    if (!active) return;

    const handleSelection = (event: MouseEvent) => {
      if ((event.target as HTMLElement | null)?.closest("button, label, input, select")) return;
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const range = selection.getRangeAt(0).cloneRange();
      if (!range.toString().trim()) return;

      setHistory((previousHistory) => [...previousHistory, ranges]);
      setRedoHistory([]);
      setRanges((previous) => [...previous, range]);
      selection.removeAllRanges();
    };

    document.addEventListener("mouseup", handleSelection);
    return () => document.removeEventListener("mouseup", handleSelection);
  }, [active, ranges]);

  useEffect(() => {
    const undo = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== "z" || history.length === 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;

      event.preventDefault();
      setHistory((previousHistory) => {
        const previous = previousHistory.at(-1);
        if (!previous) return previousHistory;
        setRedoHistory((previousRedo) => [...previousRedo, ranges]);
        setRanges(previous);
        return previousHistory.slice(0, -1);
      });
    };

    document.addEventListener("keydown", undo);
    return () => document.removeEventListener("keydown", undo);
  }, [history, ranges]);

  useEffect(() => {
    const redo = (event: KeyboardEvent) => {
      if (!event.ctrlKey || event.key.toLowerCase() !== "y" || redoHistory.length === 0) return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select")) return;

      event.preventDefault();
      setRedoHistory((previousRedo) => {
        const next = previousRedo.at(-1);
        if (!next) return previousRedo;
        setHistory((previousHistory) => [...previousHistory, ranges]);
        setRanges(next);
        return previousRedo.slice(0, -1);
      });
    };

    document.addEventListener("keydown", redo);
    return () => document.removeEventListener("keydown", redo);
  }, [redoHistory, ranges]);

  function clearHighlights() {
    setHistory((previousHistory) => [...previousHistory, ranges]);
    setRedoHistory([]);
    setRanges([]);
  }

  function undoHighlight() {
    setHistory((previousHistory) => {
      const previous = previousHistory.at(-1);
      if (!previous) return previousHistory;
      setRedoHistory((previousRedo) => [...previousRedo, ranges]);
      setRanges(previous);
      return previousHistory.slice(0, -1);
    });
  }

  function redoHighlight() {
    setRedoHistory((previousRedo) => {
      const next = previousRedo.at(-1);
      if (!next) return previousRedo;
      setHistory((previousHistory) => [...previousHistory, ranges]);
      setRanges(next);
      return previousRedo.slice(0, -1);
    });
  }

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => setActive((value) => !value)}
        className={cn(
          "ui-text rounded-xl border px-3 py-2 text-sm font-semibold transition",
          active
            ? "border-amber-500 bg-amber-400 text-slate-900"
            : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
        )}
        title={active ? "Metin seçimini bekliyor" : "Metin vurgulama aracını aç"}
      >
        🖍️ {active ? "Seç" : "Vurgula"}
      </button>
      <label
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-300 bg-white p-1.5 dark:border-slate-700 dark:bg-slate-800"
        title="Vurgu rengini değiştir"
      >
        <span
          className="h-full w-full rounded-md border border-slate-300 dark:border-slate-600"
          style={{ backgroundColor: color }}
        />
        <input
          type="color"
          value={color}
          onChange={(event) => setColor(event.target.value)}
          className="sr-only"
          aria-label="Vurgu rengini seç"
        />
      </label>
      <button
        type="button"
        onClick={undoHighlight}
        disabled={history.length === 0}
        className="ui-text rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        title="Son vurguyu geri al (Ctrl+Z)"
      >
        ↶
      </button>
      <button
        type="button"
        onClick={redoHighlight}
        disabled={redoHistory.length === 0}
        className="ui-text rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        title="Son geri alınan vurguyu yinele (Ctrl+Y)"
      >
        ↷
      </button>
      <button
        type="button"
        onClick={clearHighlights}
        disabled={ranges.length === 0}
        className="ui-text rounded-xl border border-slate-300 bg-white px-2.5 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        title="Tüm vurguları sil"
      >
        🗑️
      </button>
    </div>
  );
}
