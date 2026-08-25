type Score = { correct: number; total: number } | null;

export default function ScoreBadge({ score }: { score: Score }) {
  if (!score || score.total === 0) return null;

  const pct = Math.round((score.correct / score.total) * 100);
  const tone =
    pct >= 80
      ? "bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30"
      : pct >= 50
        ? "bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30"
        : "bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30";

  return (
    <span
      className={`ui-text inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ring-1 ring-inset ${tone}`}
    >
      {score.correct} / {score.total} doğru
      <span className="opacity-70">({pct}%)</span>
    </span>
  );
}
