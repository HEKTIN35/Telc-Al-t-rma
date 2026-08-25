import { useState, type ReactNode } from "react";
import { cn } from "../utils/cn";

export type PanelDef = {
  id: string;
  label: string;
  content: ReactNode;
};

export default function SplitLayout({ panels }: { panels: PanelDef[] }) {
  // left/right: panel id or null
  const [left, setLeft] = useState<string>(panels[0]?.id ?? "");
  const [right, setRight] = useState<string>(panels[1]?.id ?? "");

  const leftPanel = panels.find((p) => p.id === left);
  const rightPanel = panels.find((p) => p.id === right);

  function PanelPicker({
    value,
    onChange,
    side,
  }: {
    value: string;
    onChange: (id: string) => void;
    side: "Sol" | "Sağ";
  }) {
    return (
      <div className="flex items-center gap-2 mb-3">
        <span className="ui-text text-xs font-bold text-slate-400 uppercase tracking-wide w-8">{side}</span>
        <div className="flex flex-wrap gap-1.5">
          {panels.map((p) => (
            <button
              key={p.id}
              onClick={() => onChange(p.id)}
              className={cn(
                "ui-text rounded-lg px-2.5 py-1 text-xs font-semibold transition border",
                value === p.id
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-600 border-slate-300 hover:border-indigo-400 hover:text-indigo-600 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-600",
              )}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Picker row */}
      <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/60">
        <PanelPicker value={left} onChange={setLeft} side="Sol" />
        <PanelPicker value={right} onChange={setRight} side="Sağ" />
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-2 gap-4" style={{ height: "72vh" }}>
        <div className="min-w-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          {leftPanel ? leftPanel.content : <p className="text-sm text-slate-400">Panel seç</p>}
        </div>
        <div className="min-w-0 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 dark:border-slate-800 dark:bg-slate-900">
          {rightPanel ? rightPanel.content : <p className="text-sm text-slate-400">Panel seç</p>}
        </div>
      </div>
    </div>
  );
}
