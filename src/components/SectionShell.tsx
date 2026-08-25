import type { ReactNode } from "react";
import ScoreBadge from "./ScoreBadge";

type Score = { correct: number; total: number } | null;

export default function SectionShell({
  id,
  eyebrow,
  title,
  subtitle,
  score,
  onCheck,
  onReset,
  checkLabel = "Kontrol Et",
  children,
}: {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  score?: Score;
  onCheck?: () => void;
  onReset?: () => void;
  checkLabel?: string;
  children: ReactNode;
}) {
  return (
    <section
      id={id}
      className="scroll-mt-24 rounded-[28px] border border-slate-700/80 bg-slate-900/70 p-5 shadow-[0_20px_45px_rgba(3,7,18,0.28)] backdrop-blur-sm sm:p-8 dark:border-slate-700 dark:bg-slate-900/80"
    >
      <header className="mb-6 flex flex-col gap-3 border-b border-slate-700/70 pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ui-text text-[10px] font-bold tracking-[0.2em] text-violet-300 uppercase">
            {eyebrow}
          </p>
          <h2 className="ui-text mt-1 text-xl font-bold text-slate-100 sm:text-2xl">
            {title}
          </h2>
          {subtitle && (
            <p className="ui-text mt-1 text-sm text-slate-400">{subtitle}</p>
          )}
        </div>
        {score !== undefined && <ScoreBadge score={score} />}
      </header>

      <div className="space-y-6">{children}</div>

      {(onCheck || onReset) && (
        <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-slate-700/70 pt-5">
          {onCheck && (
            <button
              onClick={onCheck}
              className="ui-text inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(139,122,247,0.28)] transition hover:bg-violet-500 active:scale-[0.98]"
            >
              {checkLabel}
            </button>
          )}
          {onReset && (
            <button
              onClick={onReset}
              className="ui-text inline-flex items-center gap-2 rounded-xl border border-slate-600 bg-slate-800/80 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-700 active:scale-[0.98]"
            >
              Sıfırla
            </button>
          )}
        </div>
      )}
    </section>
  );
}
