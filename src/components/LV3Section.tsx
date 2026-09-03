import { useEffect, useRef, useState } from "react";
import type { LV3Data } from "../types";
import SectionShell from "./SectionShell";
import { cn } from "../utils/cn";

const CHOICES: { value: string; label: string; hint: string }[] = [
  { value: "+", label: "+", hint: "richtig" },
  { value: "-", label: "−", hint: "falsch" },
  { value: "x", label: "x", hint: "nicht im Text" },
];

export default function LV3Section({
  data,
  answers,
  marks,
  heading,
  headingMark,
  onAnswer,
  onCheckOne,
  onCheckHeading,
  onHeading,
  onCheckAll,
  onReset,
  score,
  splitView,
}: {
  data: LV3Data;
  answers: Record<number, string>;
  marks: Record<number, "ok" | "bad">;
  heading: string | null;
  headingMark: "ok" | "bad" | null;
  onAnswer: (id: number, value: string) => void;
  onCheckOne: (id: number) => void;
  onCheckHeading: () => void;
  onHeading: (value: string) => void;
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

  const statementsAndHeading = (
    <>
      <div className="space-y-3">
        {data.statements.map((st) => {
          const mark = marks[st.id];
          return (
            <div
              key={st.id}
              className={cn(
                "flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900",
                mark === "ok" && "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/5",
                mark === "bad" && "border-rose-300 bg-rose-50/60 dark:border-rose-500/40 dark:bg-rose-500/5",
              )}
            >
              <p className="ui-text text-sm font-medium text-slate-800 sm:pr-4 dark:text-slate-100">
                <span className="mr-2 font-bold text-indigo-600 dark:text-indigo-400">{st.id}.</span>
                {st.text}
              </p>
              <div className="flex shrink-0 items-center gap-2">
                {CHOICES.map((c) => {
                  const active = answers[st.id] === c.value;
                  return (
                    <button
                      key={c.value}
                      onClick={() => onAnswer(st.id, c.value)}
                      title={c.hint}
                      className={cn(
                        "ui-text flex h-9 w-9 items-center justify-center rounded-lg border text-sm font-bold transition",
                        active
                          ? "border-indigo-600 bg-indigo-600 text-white shadow-sm"
                          : "border-slate-300 bg-white text-slate-500 hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300",
                      )}
                    >
                      {c.label}
                    </button>
                  );
                })}
                {mark === "ok" && <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">✓</span>}
                {mark === "bad" && <span className="text-lg font-bold text-rose-600 dark:text-rose-400">✗</span>}
                {mark === "bad" && st.solution && (
                  <span className="ui-text text-xs font-bold text-emerald-700 dark:text-emerald-300">
                    Doğru: {String(st.solution)}
                  </span>
                )}
                <button type="button" onClick={() => onCheckOne(st.id)} className="ui-text rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-violet-400 hover:text-violet-600 dark:border-slate-600 dark:text-slate-300">
                  Kontrol Et
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {data.heading && (
        <div
          className={cn(
            "rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900",
            headingMark === "ok" && "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40",
            headingMark === "bad" && "border-rose-300 bg-rose-50/60 dark:border-rose-500/40",
          )}
        >
          <p className="ui-text mb-3 text-sm font-semibold text-slate-800 dark:text-slate-100">
            <span className="mr-2 font-bold text-indigo-600 dark:text-indigo-400">{data.heading.id}.</span>
            {data.heading.question}
            {headingMark === "ok" && <span className="ml-2 text-emerald-600 dark:text-emerald-400">✓</span>}
            {headingMark === "bad" && <span className="ml-2 text-rose-600 dark:text-rose-400">✗</span>}
            {headingMark === "bad" && data.heading.solution && (
              <span className="ml-2 ui-text text-xs font-bold text-emerald-700 dark:text-emerald-300">
                Doğru: {String(data.heading.solution).toUpperCase()}
              </span>
            )}
          </p>
          <div className="grid gap-2">
            {Object.entries(data.heading.options).map(([key, label]) => (
              <label
                key={key}
                className={cn(
                  "ui-text flex cursor-pointer items-start gap-3 rounded-lg border border-slate-200 p-3 text-sm text-slate-700 transition hover:border-indigo-300 dark:border-slate-700 dark:text-slate-200",
                  heading === key && "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10",
                )}
              >
                <input
                  type="radio"
                  name="lv3-heading"
                  className="mt-1 accent-indigo-600"
                  checked={heading === key}
                  onChange={() => onHeading(key)}
                />
                <span><span className="mr-1 font-bold">{key})</span>{label}</span>
              </label>
            ))}
          </div>
          <button type="button" onClick={onCheckHeading} className="ui-text mt-3 rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-600 hover:border-violet-400 hover:text-violet-600 dark:border-slate-600 dark:text-slate-300">
            Kontrol Et
          </button>
        </div>
      )}
    </>
  );

  return (
    <SectionShell
      id="lv3"
      eyebrow="Leseverstehen · Teil 3"
      title={data.title}
      subtitle="Her ifade için: + richtig (doğru) · − falsch (yanlış) · x nicht im Text (metinde yok)."
      score={score}
      onCheck={onCheckAll}
      onReset={onReset}
      checkLabel="Tümünü Kontrol Et"
    >
      {splitView && data.text ? (
        <div
          ref={splitRef}
          className="side-by-side-grid grid grid-cols-1 gap-3 overflow-hidden md:grid-cols-[minmax(0,1fr)_4px_minmax(0,1fr)] md:gap-0 md:h-[72vh]"
          style={{ gridTemplateColumns: `${leftPercent}% 4px ${100 - leftPercent}%` }}
        >
          <div
            className="h-full overflow-y-auto rounded-l-2xl border border-slate-200 p-4 sm:p-5 dark:border-slate-800"
            style={{ scrollbarWidth: "none" }}
          >
            <p className="ui-text mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Metin</p>
            <div className="reading-text text-slate-700 dark:text-slate-200">{data.text}</div>
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
            className="side-by-side-separator relative cursor-col-resize rounded-full bg-transparent transition-colors hover:bg-violet-300/40"
            title="Sola/sağa taşı"
          >
            <div className="absolute inset-y-3 left-1/2 w-px -translate-x-1/2 rounded-full bg-slate-400/60 dark:bg-slate-500/80" />
          </div>

          <div
            className="h-full space-y-4 overflow-y-auto rounded-r-2xl border border-slate-200 border-l-0 p-4 sm:p-5 dark:border-slate-800"
            style={{ scrollbarWidth: "none" }}
          >
            <p className="ui-text text-sm font-semibold text-slate-500 dark:text-slate-400">İfadeler</p>
            {statementsAndHeading}
          </div>
        </div>
      ) : (
        <>
          {data.text && (
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setShowText((s) => !s)}
                className="ui-text flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-800/60"
              >
                Metni göster / gizle
                <span className="text-slate-400">{showText ? "▲" : "▼"}</span>
              </button>
              {showText && (
                <div className="reading-text border-t border-slate-100 p-4 text-slate-700 sm:p-6 dark:border-slate-800 dark:text-slate-200">
                  {data.text}
                </div>
              )}
            </div>
          )}
          {statementsAndHeading}
        </>
      )}
    </SectionShell>
  );
}
