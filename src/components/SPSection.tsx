import { useMemo, type ReactNode } from "react";
import type { SPData } from "../types";
import SectionShell from "./SectionShell";
import { cn } from "../utils/cn";

export default function SPSection({
  data,
  answers,
  marks,
  onAnswer,
  onCheckAll,
  onReset,
  score,
  splitView,
}: {
  data: SPData;
  answers: Record<string, string>;
  marks: Record<string, "ok" | "bad">;
  onAnswer: (id: string, value: string) => void;
  onCheckAll: () => void;
  onReset: () => void;
  score: { correct: number; total: number } | null;
  splitView: boolean;
}) {
  const itemMap = useMemo(() => new Map(data.items.map((it) => [String(it.id), it])), [data.items]);

  // Metni paragraflara böl, [[N]] yerlerine inline dropdown koy
  const nodes = useMemo(() => {
    return data.text
      .split(/\n+/)
      .map((para, i) => {
        const trimmed = para.trim();
        if (!trimmed) return null;
        const parts: ReactNode[] = [];
        // Accept either [[N]] placeholders or bare numbers (e.g. 25) used in some datasets
        const re = /(?:\[\[(\d+)\]\]|\b(\d+)\b)/g;
        let last = 0;
        let m: RegExpExecArray | null;
        let idx = 0;
        while ((m = re.exec(trimmed)) !== null) {
          const matchIndex = m.index;
          if (matchIndex > last) parts.push(<span key={`${i}-t-${idx++}`}>{trimmed.slice(last, matchIndex)}</span>);
          const id = m[1] ?? m[2];
          const item = itemMap.get(String(id));
          const mark = marks[String(id)];
          parts.push(
            <span key={`s-${id}-${i}-${matchIndex}`}>
              <select
              value={answers[String(id)] ?? ""}
              onChange={(e) => onAnswer(String(id), e.target.value)}
              className={cn(
                "ui-text mx-1 my-0.5 inline-block rounded-lg border-2 border-slate-300 bg-white px-2 py-0.5 align-baseline text-[0.68em] font-semibold text-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
                mark === "ok" && "border-emerald-400 bg-emerald-50 text-emerald-800 dark:border-emerald-500/60 dark:bg-emerald-500/10 dark:text-emerald-300",
                mark === "bad" && "border-rose-400 bg-rose-50 text-rose-800 dark:border-rose-500/60 dark:bg-rose-500/10 dark:text-rose-300",
              )}
              >
                <option value="">({id})</option>
                {item && (["a", "b", "c", "d"] as const).map((k) => (
                  <option key={k} value={k}>{k}) {item.options[k]}</option>
                ))}
              </select>
              {score !== null && item && (
                <span className="ui-text ml-1 inline-block text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Doğru: {item.solution.toUpperCase()}) {item.options[item.solution]}
                </span>
              )}
            </span>,
          );
          last = matchIndex + (m[0]?.length ?? 0);
        }
        if (last < trimmed.length) parts.push(<span key={`${i}-last`}>{trimmed.slice(last)}</span>);
        return <p key={`p-${i}`} className="mb-4 last:mb-0">{parts}</p>;
      })
      .filter(Boolean);
  }, [data.text, itemMap, answers, marks, onAnswer]);

  const itemList = (
    <div className="space-y-2">
      <p className="ui-text mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">Seçenekler</p>
      {data.items.map((item) => {
        const id = String(item.id);
        const mark = marks[id];
        return (
          <div
            key={id}
            className={cn(
              "rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900",
              mark === "ok" && "border-emerald-300 bg-emerald-50/60 dark:border-emerald-500/40 dark:bg-emerald-500/5",
              mark === "bad" && "border-rose-300 bg-rose-50/60 dark:border-rose-500/40 dark:bg-rose-500/5",
            )}
          >
            <div className="mb-2 flex items-center gap-2">
              <span className="ui-text flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                {id}
              </span>
              {mark === "ok" && <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">✓</span>}
              {mark === "bad" && <span className="text-sm font-bold text-rose-600 dark:text-rose-400">✗</span>}
              {score !== null && (
                <span className="ui-text text-xs font-bold text-emerald-700 dark:text-emerald-300">
                  Doğru: {item.solution.toUpperCase()}) {item.options[item.solution]}
                </span>
              )}
            </div>
            <select
              value={answers[id] ?? ""}
              onChange={(e) => onAnswer(id, e.target.value)}
              className={cn(
                "ui-text w-full rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-semibold text-slate-700 focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100",
                mark === "ok" && "border-emerald-400",
                mark === "bad" && "border-rose-400",
              )}
            >
              <option value="">Seç…</option>
              {(["a", "b", "c", "d"] as const).map((k) => (
                <option key={k} value={k}>{k}) {item.options[k]}</option>
              ))}
            </select>
          </div>
        );
      })}
    </div>
  );

  return (
    <SectionShell
      id="sp"
      eyebrow="Sprachbausteine"
      title={data.title}
      subtitle="Her boşluk için açılır menüden doğru seçeneği belirle."
      score={score}
      onCheck={onCheckAll}
      onReset={onReset}
      checkLabel="Tümünü Kontrol Et"
    >
      {splitView ? (
        // Sol: metin + dropdown'lar | Sağ: seçenek listesi
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{ minHeight: "60vh" }}>
          <div className="overflow-y-auto rounded-2xl bg-slate-50 p-4 sm:p-5 dark:bg-slate-950/40">
            <div className="reading-text text-slate-800 dark:text-slate-100">{nodes}</div>
          </div>
          <div className="overflow-y-auto pr-1">
            {itemList}
          </div>
        </div>
      ) : (
        <div className="reading-text min-w-0 rounded-2xl bg-slate-50 p-4 text-slate-800 sm:p-6 dark:bg-slate-950/40 dark:text-slate-100">
          {nodes}
        </div>
      )}
    </SectionShell>
  );
}
