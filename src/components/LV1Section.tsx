import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { LV1Data } from "../types";
import SectionShell from "./SectionShell";
import { cn } from "../utils/cn";

type Marks = Record<string, "ok" | "bad">;

export default function LV1Section({
  data,
  answers,
  marks,
  onPlace,
  onRemove,
  onCheckOne,
  onCheckAll,
  onReset,
  score,
  splitView,
}: {
  data: LV1Data;
  answers: Record<string, string>;
  marks: Marks;
  onPlace: (blankId: string, key: string) => void;
  onRemove: (blankId: string) => void;
  onCheckOne: (blankId: string) => void;
  onCheckAll: () => void;
  onReset: () => void;
  score: { correct: number; total: number } | null;
  splitView: boolean;
}) {
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [draggingKey, setDraggingKey] = useState<string | null>(null);
  const [popId, setPopId] = useState<string | null>(null);
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

  const usedKeys = useMemo(() => new Set(Object.values(answers)), [answers]);

  function place(blankId: string, key: string) {
    onPlace(blankId, key);
    setSelectedKey(null);
    setPopId(blankId);
    window.setTimeout(() => setPopId((p) => (p === blankId ? null : p)), 260);
  }

  function handleBlankClick(blankId: string, filled: boolean) {
    if (selectedKey) { place(blankId, selectedKey); return; }
    if (filled) onRemove(blankId);
  }

  function makeBlank(id: string): ReactNode {
    const chosenKey = answers[id];
    const mark = marks[id];
    const filled = Boolean(chosenKey);
    return (
      <span
        key={`b-${id}`}
        data-blank-id={id}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setDragOverId(id)}
        onDragLeave={() => setDragOverId((d) => (d === id ? null : d))}
        onDrop={(e) => {
          e.preventDefault();
          setDragOverId(null);
          const key = e.dataTransfer.getData("text/plain");
          if (key) place(id, key);
        }}
        onClick={() => handleBlankClick(id, filled)}
        className={cn(
          "mx-1 my-0.5 inline-flex cursor-pointer items-center gap-1 rounded-lg border border-dashed border-slate-400/80 bg-slate-100 px-2 py-0.5 align-baseline font-sans text-[0.7em] font-semibold whitespace-nowrap text-slate-700 transition-all duration-150 select-none dark:border-slate-500/80 dark:bg-slate-800/55 dark:text-slate-100",
          filled && "border-solid border-violet-400/80 bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-100",
          dragOverId === id && "scale-105 border-violet-400 bg-violet-500/15 shadow-[0_0_0_2px_rgba(167,139,250,0.35)]",
          popId === id && "animate-[pop_0.26s_ease-out]",
          mark === "ok" && "border-solid border-emerald-400/80 bg-emerald-500/10 text-emerald-100",
          mark === "bad" && "border-solid border-rose-400/80 bg-rose-500/10 text-rose-100",
        )}
        title={filled ? "Kaldırmak için tıkla" : "Yerleştirmek için önce bir cümle seç veya sürükle"}
      >
        <span className="rounded-md bg-slate-900/5 px-1.5 py-0.5 dark:bg-white/10">{id}</span>
        {filled ? chosenKey!.toUpperCase() : "···"}
        {mark === "ok" && <span className="text-emerald-600 dark:text-emerald-400">✓</span>}
        {mark === "bad" && <span className="text-rose-600 dark:text-rose-400">✗</span>}
        {mark !== undefined && data.solution[id] && (
          <span className="ui-text text-xs font-bold text-emerald-700 dark:text-emerald-300">
            Doğru: {String(data.solution[id]).trim().toUpperCase()}
          </span>
        )}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onCheckOne(id); }}
          className="ml-0.5 rounded border border-slate-300 bg-slate-200 px-1 text-[0.85em] font-medium text-slate-700 hover:bg-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          title="Bu boşluğu kontrol et"
        >?</button>
        {filled && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onRemove(id); }}
            className="rounded border border-slate-300 bg-slate-200 px-1 text-[0.85em] font-medium text-slate-700 hover:bg-rose-100 hover:text-rose-700 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-200"
            title="Kaldır"
          >×</button>
        )}
      </span>
    );
  }

  // Metni \n'ye göre paragraflara böl → her paragraf kendi <p> tagı olur
  // Böylece white-space:pre-line'a gerek kalmaz, metin geniş akar
  const nodes = useMemo((): ReactNode[] => {
    return data.text
      .split(/\n\s*\n/)
      .map((para, i) => {
        const trimmed = para.replace(/\s*\n\s*/g, " ").trim();
        if (!trimmed) return null;
        const parts: ReactNode[] = [];
        const re = /\[\[(\d+)\]\]/g;
        let last = 0;
        let m: RegExpExecArray | null;
        let idx = 0;
        while ((m = re.exec(trimmed)) !== null) {
          if (m.index > last) parts.push(<span key={`${i}-t-${idx++}`}>{trimmed.slice(last, m.index)}</span>);
          parts.push(makeBlank(m[1]));
          last = re.lastIndex;
        }
        if (last < trimmed.length) parts.push(<span key={`${i}-end`}>{trimmed.slice(last)}</span>);
        return <p key={`para-${i}`} className="mb-4 last:mb-0">{parts}</p>;
      })
      .filter((x): x is ReactNode => x !== null);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.text, answers, marks, dragOverId, popId, selectedKey]);

  const optionsList = (
    <div>
      <p className="ui-text mb-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
        Cümleler {selectedKey ? "· bir boşluğa dokunarak yerleştir" : ""}
      </p>
      <div className="thin-scrollbar flex max-h-[32rem] flex-col gap-2.5 overflow-y-auto pr-1 lg:max-h-[70vh]">
        {data.options.map((opt) => {
          const used = usedKeys.has(opt.key);
          const selected = selectedKey === opt.key;
          return (
            <div
              key={opt.key}
              draggable={!used}
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", opt.key);
                e.dataTransfer.effectAllowed = "move";
                document.body.style.cursor = "grabbing";
                setDraggingKey(opt.key);

                const ghost = e.currentTarget.cloneNode(true) as HTMLElement;
                ghost.classList.add("lv1-drag-ghost");
                ghost.style.position = "fixed";
                ghost.style.left = "-9999px";
                ghost.style.top = "-9999px";
                ghost.style.pointerEvents = "none";
                ghost.style.zIndex = "99999";
                document.body.appendChild(ghost);

                const rect = e.currentTarget.getBoundingClientRect();
                e.dataTransfer.setDragImage(ghost, rect.width / 2, rect.height / 2);

                window.setTimeout(() => {
                  ghost.remove();
                }, 0);
              }}
              onDragEnd={() => {
                setDraggingKey(null);
                document.body.style.cursor = "";
              }}
              onClick={() => { if (used) return; setSelectedKey((k) => (k === opt.key ? null : opt.key)); }}
              className={cn(
                "ui-text rounded-xl border border-slate-200 bg-white p-3 text-sm leading-relaxed text-slate-700 shadow-sm transition duration-150 ease-out dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200",
                !used && "cursor-grab hover:border-indigo-300 hover:shadow-md active:cursor-grabbing",
                draggingKey === opt.key && "cursor-grabbing",
                used && "cursor-default opacity-40",
                selected && "border-indigo-500 ring-2 ring-indigo-300 dark:ring-indigo-500/40",
                draggingKey === opt.key && "scale-[0.98] -rotate-1 border-indigo-400 bg-indigo-50 shadow-xl shadow-indigo-500/10 dark:bg-indigo-500/10",
              )}
            >
              <div className="mb-1.5 flex items-center gap-2">
                <span className="flex h-6 w-6 items-center justify-center rounded-md border border-slate-300 bg-slate-100 text-xs font-bold text-slate-600 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200">
                  {opt.key}
                </span>
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  {used ? "Yerleştirildi" : "Sürükle veya seç"}
                </span>
              </div>
              {opt.text}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <SectionShell
      id="lv1"
      eyebrow="Leseverstehen · Teil 1"
      title={data.title}
      subtitle="Metindeki boşluklara uygun cümleleri sürükleyip bırak ya da önce bir cümle seç, sonra boşluğa dokun."
      score={score}
      onCheck={onCheckAll}
      onReset={onReset}
      checkLabel="Tümünü Kontrol Et"
    >
      {splitView ? (
        <div
          ref={splitRef}
          className="side-by-side-grid grid grid-cols-1 gap-3 overflow-hidden md:grid-cols-[minmax(0,1fr)_4px_minmax(0,1fr)] md:gap-0 md:h-[72vh]"
          style={{ gridTemplateColumns: `${leftPercent}% 4px ${100 - leftPercent}%` }}
        >
          <div
            className="h-full overflow-y-auto rounded-l-2xl border border-slate-200 bg-slate-50 p-4 text-slate-800 sm:p-5 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-100"
            style={{ scrollbarWidth: "none" }}
          >
            <div className="reading-text lv1-reading-content">{nodes}</div>
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
            className="h-full overflow-y-auto rounded-r-2xl border border-slate-200 border-l-0 p-3 sm:p-4 dark:border-slate-800"
            style={{ scrollbarWidth: "none" }}
          >
            {optionsList}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
          <div className="reading-text min-w-0 rounded-2xl bg-slate-50 p-4 text-slate-800 sm:p-6 dark:bg-slate-950/40 dark:text-slate-100">
            {nodes}
          </div>
          {optionsList}
        </div>
      )}
    </SectionShell>
  );
}
