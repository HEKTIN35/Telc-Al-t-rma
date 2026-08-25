import { useEffect, useRef, useState } from "react";
import type { LV2Data } from "../types";
import SectionShell from "./SectionShell";
import { cn } from "../utils/cn";

const KEYS = ["a", "b", "c", "d", "e"];

export default function LV2Section({
  data,
  answers,
  marks,
  onAnswer,
  onCheckAll,
  onReset,
  score,
  splitView,
}: {
  data: LV2Data;
  answers: Record<number, string>;
  marks: Record<number, "ok" | "bad">;
  onAnswer: (id: number, key: string) => void;
  onCheckAll: () => void;
  onReset: () => void;
  score: { correct: number; total: number } | null;
  splitView: boolean;
}) {
  const [showText, setShowText] = useState(true);
  const [leftPercent, setLeftPercent] = useState(52);
  const splitRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef(false);

  useEffect(() => {
    if (!splitView) return;

    const handlePointerMove = (event: PointerEvent) => {
      if (!draggingRef.current || !splitRef.current) return;

      const bounds = splitRef.current.getBoundingClientRect();
      const next = ((event.clientX - bounds.left) / bounds.width) * 100;
      setLeftPercent(Math.min(72, Math.max(28, next)));
    };

    const handlePointerUp = () => {
      draggingRef.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [splitView]);

  const paragraphsPanel = (
    <div className="space-y-4">
      {data.paragraphs.map((p) => (
        <div key={p.key} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
          <span className="ui-text mb-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
            {p.key}
          </span>
          <p className="reading-text mt-2 text-slate-700 dark:text-slate-200">{p.text}</p>
        </div>
      ))}
    </div>
  );

  const questionsPanel = (
    <div className="space-y-3">
      {data.questions.map((q) => {
        const mark = marks[q.id];
        return (
          <div
            key={q.id}
            className={cn(
              "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900",
              mark === "ok" && "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/5",
              mark === "bad" && "border-rose-300 bg-rose-50/60 dark:border-rose-500/40 dark:bg-rose-500/5",
            )}
          >
            <p className="ui-text text-sm font-medium text-slate-800 sm:pr-4 dark:text-slate-100">
              <span className="mr-2 font-bold text-indigo-600 dark:text-indigo-400">{q.id}.</span>
              {q.text}
            </p>
            <div className="flex shrink-0 items-center gap-2">
              <select
                value={answers[q.id] ?? ""}
                onChange={(e) => onAnswer(q.id, e.target.value)}
                className={cn(
                  "ui-text rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:focus:ring-indigo-500/30",
                  mark === "ok" && "border-emerald-400",
                  mark === "bad" && "border-rose-400",
                )}
              >
                <option value="">Seç…</option>
                {KEYS.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
              {mark === "ok" && <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">✓</span>}
              {mark === "bad" && <span className="text-lg font-bold text-rose-600 dark:text-rose-400">✗</span>}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <SectionShell
      id="lv2"
      eyebrow="Leseverstehen · Teil 2"
      title={data.title}
      subtitle="Her soru için ilgili paragrafın harfini (a–e) seç."
      score={score}
      onCheck={onCheckAll}
      onReset={onReset}
      checkLabel="Tümünü Kontrol Et"
    >
      {splitView ? (
        <div
          ref={splitRef}
          className="grid h-[72vh] overflow-hidden"
          style={{
            gridTemplateColumns: `${leftPercent}% 4px ${100 - leftPercent}%`,
          }}
        >
          <div
            className="h-full overflow-y-auto rounded-l-2xl border border-slate-200 p-4 sm:p-5 dark:border-slate-800"
            style={{ scrollbarWidth: "none" }}
          >
            <p className="ui-text mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Paragraflar (a–e)</p>
            {paragraphsPanel}
          </div>

          <div
            role="separator"
            aria-orientation="vertical"
            onPointerDown={(event) => {
              event.preventDefault();
              draggingRef.current = true;
              document.body.style.cursor = "col-resize";
              document.body.style.userSelect = "none";
            }}
            className="relative cursor-col-resize rounded-full bg-transparent transition-colors hover:bg-violet-300/40"
            title="Sola/sağa taşı"
          >
            <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 rounded-full bg-slate-400/60 dark:bg-slate-500/80" />
          </div>

          <div
            className="h-full overflow-y-auto rounded-r-2xl border border-slate-200 border-l-0 p-4 sm:p-5 dark:border-slate-800"
            style={{ scrollbarWidth: "none" }}
          >
            <p className="ui-text mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Sorular</p>
            {questionsPanel}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setShowText((s) => !s)}
              className="ui-text flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
            >
              Paragrafları göster / gizle (a–e)
              <span className="text-slate-400">{showText ? "▲" : "▼"}</span>
            </button>
            {showText && (
              <div className={cn("space-y-4 p-4 sm:p-5", "border-t border-slate-100 dark:border-slate-800")}>
                {data.paragraphs.map((p) => (
                  <div key={p.key} className="rounded-xl bg-slate-50 p-4 dark:bg-slate-950/40">
                    <span className="ui-text mb-1.5 inline-flex h-6 w-6 items-center justify-center rounded-md bg-slate-200 text-xs font-bold text-slate-700 dark:bg-slate-700 dark:text-slate-200">
                      {p.key}
                    </span>
                    <p className="reading-text mt-2 text-slate-700 dark:text-slate-200">{p.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {questionsPanel}
        </>
      )}
    </SectionShell>
  );
}
