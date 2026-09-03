import { useRef, useEffect, useState } from "react";
import ScoreBadge from "./ScoreBadge";
import { cn } from "../utils/cn";
import HighlightTool from "./HighlightTool";

export default function Header({
  theme,
  onToggleTheme,
  reading,
  onToggleReading,
  onFileUpload,
  fileName,
  onCheckAll,
  onResetAll,
  overallScore,
  sections,
  splitView,
  onToggleSplitView,
}: {
  theme: "light" | "dark";
  onToggleTheme: () => void;
  reading: boolean;
  onToggleReading: () => void;
  onFileUpload: (file: File) => void;
  fileName: string | null;
  onCheckAll: () => void;
  onResetAll: () => void;
  overallScore: { correct: number; total: number } | null;
  sections: { id: string; label: string; enabled: boolean }[];
  splitView: boolean;
  onToggleSplitView: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const y = window.scrollY;
        // Collapse only after leaving the top area; this prevents the sticky
        // header's height change from oscillating around the threshold.
        if (y > 240 && y > lastScrollY.current + 5) {
          setCollapsed(true);
        }
        // Re-open only after returning fully to the top.
        if (y < 16) {
          setCollapsed(false);
        }
        lastScrollY.current = y;
        ticking = false;
      });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const enabledSections = sections.filter((s) => s.enabled);

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-950/90">
      {/* Collapsed mini-bar */}
      <div
        className={cn(
          "mx-auto max-w-5xl overflow-hidden transition-all duration-300",
          collapsed ? "max-h-14 opacity-100" : "max-h-0 opacity-0 pointer-events-none",
        )}
      >
        <div className="flex h-12 items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 text-xs font-black text-white">
              C1
            </div>
            <span className="ui-text text-sm font-bold text-slate-700 dark:text-slate-200">telc C1 Trainer</span>
            {overallScore && overallScore.total > 0 && <ScoreBadge score={overallScore} />}
          </div>
          <div className="flex items-center gap-1.5">
            {splitView && (
              <span className="ui-text hidden rounded-md bg-violet-100 px-2 py-1 text-xs font-semibold text-violet-700 sm:inline dark:bg-violet-500/20 dark:text-violet-300">
                ⬛⬛ Yan Yana
              </span>
            )}
            <button
              onClick={onToggleTheme}
              className="ui-text rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              title="Koyu / açık modu değiştir"
            >
              {theme === "dark" ? "☀️ Açık" : "🌙 Koyu"}
            </button>
            <button
              onClick={onToggleReading}
              className={cn(
                "ui-text rounded-lg border px-2.5 py-1.5 text-xs font-bold transition",
                reading
                  ? "border-indigo-500 bg-indigo-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
              )}
              title="Okuma modu"
            >
              📖
            </button>
            <button
              onClick={onToggleSplitView}
              className={cn(
                "ui-text rounded-lg border px-2.5 py-1.5 text-xs font-bold transition",
                splitView
                  ? "border-violet-500 bg-violet-600 text-white"
                  : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
              )}
              title="Yan yana görünüm"
            >
              ⬛⬛
            </button>
            <HighlightTool />
            <button
              onClick={onCheckAll}
              className="ui-text rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
            >
              Kontrol Et
            </button>
            <button
              onClick={onResetAll}
              className="ui-text rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Sıfırla
            </button>
          </div>
        </div>
      </div>

      {/* Full header */}
      <div
        className={cn(
          "mx-auto max-w-5xl overflow-hidden transition-all duration-300",
          collapsed ? "max-h-0 opacity-0 pointer-events-none" : "max-h-96 opacity-100",
        )}
      >
        <div className="px-4 py-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-lg font-black text-white shadow-md shadow-indigo-200 dark:shadow-none">
                C1
              </div>
              <div>
                <h1 className="ui-text text-base leading-tight font-extrabold text-slate-900 sm:text-lg dark:text-white">
                  telc C1 Trainer
                </h1>
                <p className="ui-text text-xs text-slate-500 dark:text-slate-400">
                  Almanca okuma &amp; dilbilgisi alıştırmaları · tamamen offline
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {overallScore && overallScore.total > 0 && <ScoreBadge score={overallScore} />}

              <button
                onClick={onToggleReading}
                className={cn(
                  "ui-text rounded-xl border px-3 py-2 text-sm font-semibold transition",
                  reading
                    ? "border-indigo-500 bg-indigo-600 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
                )}
              >
                📖 Okuma Modu
              </button>

              <button
                onClick={onToggleSplitView}
                className={cn(
                  "ui-text rounded-xl border px-3 py-2 text-sm font-semibold transition",
                  splitView
                    ? "border-violet-500 bg-violet-600 text-white"
                    : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700",
                )}
                title="Her bölümde metin ve cevapları yan yana göster"
              >
                ⬛⬛ Yan Yana
              </button>

              <button
                onClick={onToggleTheme}
                className="ui-text rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                {theme === "dark" ? "☀️ Açık" : "🌙 Koyu"}
              </button>
              <HighlightTool />

              <button
                onClick={() => inputRef.current?.click()}
                className="ui-text rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                📂 JSON Yükle
              </button>
              <input
                ref={inputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) onFileUpload(f);
                  e.target.value = "";
                }}
              />
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
            <nav className="flex flex-wrap gap-1.5">
              {enabledSections.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="ui-text rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800"
                >
                  {s.label}
                </a>
              ))}
            </nav>
            <div className="ml-auto flex items-center gap-2">
              {fileName && (
                <span className="ui-text hidden text-xs text-slate-400 sm:inline">
                  Yüklü: <span className="font-medium text-slate-500 dark:text-slate-300">{fileName}</span>
                </span>
              )}
              <button
                onClick={onCheckAll}
                className="ui-text rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-bold text-white transition hover:bg-slate-700 dark:bg-indigo-600 dark:hover:bg-indigo-500"
              >
                Hepsini Kontrol Et
              </button>
              <button
                onClick={onResetAll}
                className="ui-text rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-bold text-slate-500 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
              >
                Sıfırla
              </button>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
