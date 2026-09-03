import { useEffect, useMemo, useState } from "react";
import type { TrainerData } from "./types";
import sampleData from "./data/sampleData";
import Header from "./components/Header";
import LV1Section from "./components/LV1Section";
import LV2Section from "./components/LV2Section";
import LV3Section from "./components/LV3Section";
import SPSection from "./components/SPSection";

type Score = { correct: number; total: number } | null;
type MarkMap = Record<string | number, "ok" | "bad">;

const SECTION_IDS = ["lv1", "lv2", "lv3", "sp"] as const;
type SectionId = (typeof SECTION_IDS)[number];

const SESSION_STORAGE_KEY = "telc-trainer-session";

type SavedSession = {
  data: TrainerData;
  fileName: string | null;
  lv1Answers: Record<string, string>;
  lv2Answers: Record<number, string>;
  lv3Answers: Record<number, string>;
  lv3Heading: string | null;
  spAnswers: Record<string, string>;
  scrollY: number;
};

function loadSavedSession(): Partial<SavedSession> {
  if (typeof window === "undefined") return {};
  const saved = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!saved) return {};

  try {
    const parsed = JSON.parse(saved) as Partial<SavedSession>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    return {};
  }
}

export default function App() {
  const [savedSession] = useState(loadSavedSession);
  const [data, setData] = useState<TrainerData>(savedSession.data ?? sampleData);
  const [fileName, setFileName] = useState<string | null>(savedSession.fileName ?? null);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window === "undefined") return "light";
    return (localStorage.getItem("telc-theme") as "light" | "dark") || "light";
  });
  const [reading, setReading] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("telc-reading") === "1";
  });
  const [splitView, setSplitView] = useState<boolean>(false);

  // LV1
  const [lv1Answers, setLv1Answers] = useState<Record<string, string>>(savedSession.lv1Answers ?? {});
  const [lv1Marks, setLv1Marks] = useState<MarkMap>({});
  const [lv1Score, setLv1Score] = useState<Score>(null);

  // LV2
  const [lv2Answers, setLv2Answers] = useState<Record<number, string>>(savedSession.lv2Answers ?? {});
  const [lv2Marks, setLv2Marks] = useState<MarkMap>({});
  const [lv2Score, setLv2Score] = useState<Score>(null);

  // LV3
  const [lv3Answers, setLv3Answers] = useState<Record<number, string>>(savedSession.lv3Answers ?? {});
  const [lv3Marks, setLv3Marks] = useState<MarkMap>({});
  const [lv3Heading, setLv3Heading] = useState<string | null>(savedSession.lv3Heading ?? null);
  const [lv3HeadingMark, setLv3HeadingMark] = useState<"ok" | "bad" | null>(null);
  const [lv3Score, setLv3Score] = useState<Score>(null);

  // SP
  const [spAnswers, setSpAnswers] = useState<Record<string, string>>(savedSession.spAnswers ?? {});
  const [spMarks, setSpMarks] = useState<MarkMap>({});
  const [spScore, setSpScore] = useState<Score>(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.style.colorScheme = theme;
    localStorage.setItem("telc-theme", theme);
  }, [theme]);

  useEffect(() => {
    document.body.classList.toggle("reading-mode", reading);
    localStorage.setItem("telc-reading", reading ? "1" : "0");
  }, [reading]);

  useEffect(() => {
    const saveSession = () => {
      const previous = loadSavedSession();
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        ...previous,
        data,
        fileName,
        lv1Answers,
        lv2Answers,
        lv3Answers,
        lv3Heading,
        spAnswers,
        scrollY: window.scrollY,
      } satisfies SavedSession));
    };

    saveSession();
  }, [data, fileName, lv1Answers, lv2Answers, lv3Answers, lv3Heading, spAnswers]);

  useEffect(() => {
    const savedScrollY = savedSession.scrollY;
    if (typeof savedScrollY !== "number") return;
    const restore = window.setTimeout(() => window.scrollTo({ top: savedScrollY, behavior: "auto" }), 0);
    return () => window.clearTimeout(restore);
  }, [savedSession.scrollY]);

  useEffect(() => {
    const saveScrollPosition = () => {
      const current = loadSavedSession();
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        ...current,
        data: current.data ?? data,
        fileName: current.fileName ?? fileName,
        scrollY: window.scrollY,
      }));
    };
    window.addEventListener("scroll", saveScrollPosition, { passive: true });
    return () => window.removeEventListener("scroll", saveScrollPosition);
  }, [data, fileName]);

  function resetAllAnswers() {
    setLv1Answers({});
    setLv1Marks({});
    setLv1Score(null);
    setLv2Answers({});
    setLv2Marks({});
    setLv2Score(null);
    setLv3Answers({});
    setLv3Marks({});
    setLv3Heading(null);
    setLv3HeadingMark(null);
    setLv3Score(null);
    setSpAnswers({});
    setSpMarks({});
    setSpScore(null);
  }

  async function handleFileUpload(file: File) {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as TrainerData;
      setData(parsed);
      setFileName(file.name);
      setError(null);
      resetAllAnswers();
    } catch (err) {
      setError("JSON dosyası okunamadı: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  // ---------- LV1 handlers ----------
  function lv1Place(blankId: string, key: string) {
    setLv1Answers((prev) => {
      const next = { ...prev };
      for (const k in next) {
        if (next[k] === key) delete next[k];
      }
      next[blankId] = key;
      return next;
    });
    setLv1Marks((prev) => {
      const next = { ...prev };
      delete next[blankId];
      return next;
    });
  }
  function lv1Remove(blankId: string) {
    setLv1Answers((prev) => {
      const next = { ...prev };
      delete next[blankId];
      return next;
    });
    setLv1Marks((prev) => {
      const next = { ...prev };
      delete next[blankId];
      return next;
    });
  }
  function lv1CheckOne(blankId: string) {
    const sol = data.lv1?.solution?.[blankId];
    if (!sol) return;
    const chosen = lv1Answers[blankId];
    setLv1Marks((prev) => {
      const next = { ...prev };
      next[blankId] = String(chosen ?? "").trim().toLowerCase() === String(sol).trim().toLowerCase() ? "ok" : "bad";
      return next;
    });
  }
  function lv1CheckAll() {
    const lv1 = data.lv1;
    if (!lv1) return;
    const solution = lv1.solution ?? {};
    const ids = Object.keys(solution);
    let correct = 0;
    const nextMarks: MarkMap = {};
    ids.forEach((id) => {
      const chosen = String(lv1Answers[id] ?? "").trim().toLowerCase();
      const expected = String(solution[id] ?? "").trim().toLowerCase();
      if (chosen && expected && chosen === expected) {
        nextMarks[id] = "ok";
        correct++;
      } else {
        nextMarks[id] = "bad";
      }
    });
    setLv1Marks(nextMarks);
    setLv1Score({ correct, total: ids.length });
  }

  // ---------- LV2 handlers ----------
  function lv2Answer(id: number, key: string) {
    setLv2Answers((prev) => ({ ...prev, [id]: key }));
    setLv2Marks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  function lv2CheckOne(id: number) {
    const question = data.lv2?.questions.find((q) => q.id === id);
    if (!question) return;
    const chosen = lv2Answers[id];
    setLv2Marks((prev) => ({ ...prev, [id]: String(chosen ?? "").trim().toLowerCase() === String(question.solution).trim().toLowerCase() ? "ok" : "bad" }));
  }
  function lv2CheckAll() {
    const lv2 = data.lv2;
    if (!lv2?.questions?.length) return;
    let correct = 0;
    const nextMarks: MarkMap = {};
    lv2.questions.forEach((q) => {
      if (!q.solution) return;
      const chosen = lv2Answers[q.id];
      if (String(chosen ?? "").trim().toLowerCase() === String(q.solution).trim().toLowerCase()) {
        nextMarks[q.id] = "ok";
        correct++;
      } else {
        nextMarks[q.id] = "bad";
      }
    });
    setLv2Marks(nextMarks);
    setLv2Score({ correct, total: lv2.questions.length });
  }

  // ---------- LV3 handlers ----------
  function lv3Answer(id: number, value: string) {
    setLv3Answers((prev) => ({ ...prev, [id]: value }));
    setLv3Marks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  function lv3CheckOne(id: number) {
    const statement = data.lv3?.statements.find((st) => st.id === id);
    if (!statement) return;
    const chosen = lv3Answers[id];
    setLv3Marks((prev) => ({ ...prev, [id]: String(chosen ?? "").trim().toLowerCase() === String(statement.solution).trim().toLowerCase() ? "ok" : "bad" }));
  }
  function lv3CheckHeading() {
    const solution = data.lv3?.heading?.solution;
    if (!solution) return;
    setLv3HeadingMark(lv3Heading === solution ? "ok" : "bad");
  }
  function lv3CheckAll() {
    const lv3 = data.lv3;
    if (!lv3) return;
    let correct = 0;
    let total = 0;
    const nextMarks: MarkMap = {};
    (lv3.statements ?? []).forEach((st) => {
      if (!st.solution) return;
      total++;
      const chosen = lv3Answers[st.id];
      if (String(chosen ?? "").trim().toLowerCase() === String(st.solution).trim().toLowerCase()) {
        nextMarks[st.id] = "ok";
        correct++;
      } else {
        nextMarks[st.id] = "bad";
      }
    });
    setLv3Marks(nextMarks);

    let headingMark: "ok" | "bad" | null = null;
    if (lv3.heading) {
      total++;
      const headingSolution = String(lv3.heading.solution ?? "").trim().toLowerCase();
      const headingAnswer = String(lv3Heading ?? "").trim().toLowerCase();
      if (headingAnswer) {
        headingMark = headingAnswer === headingSolution ? "ok" : "bad";
        if (headingMark === "ok") correct++;
      }
    }
    setLv3HeadingMark(headingMark);
    setLv3Score({ correct, total });
  }

  // ---------- SP handlers ----------
  function spAnswer(id: string, value: string) {
    setSpAnswers((prev) => ({ ...prev, [id]: value }));
    setSpMarks((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }
  function spCheckOne(id: string) {
    const item = data.sp?.items.find((entry) => String(entry.id) === id);
    if (!item) return;
    const chosen = spAnswers[id];
    setSpMarks((prev) => ({ ...prev, [id]: chosen === item.solution ? "ok" : "bad" }));
  }
  function spCheckAll() {
    const sp = data.sp;
    if (!sp?.items?.length) return;
    let correct = 0;
    let total = 0;
    const nextMarks: MarkMap = {};
    sp.items.forEach((item) => {
      const id = String(item.id);
      if (!item.solution) return;
      total++;
      const chosenKey = String(spAnswers[id] ?? "").trim().toLowerCase();
      const normalizedSolution = String(item.solution).trim().toLowerCase();
      if (chosenKey && chosenKey === normalizedSolution) {
        nextMarks[id] = "ok";
        correct++;
      } else {
        nextMarks[id] = "bad";
      }
    });
    setSpMarks(nextMarks);
    setSpScore({ correct, total });
  }

  function checkAll() {
    if (data.lv1) lv1CheckAll();
    if (data.lv2) lv2CheckAll();
    if (data.lv3) lv3CheckAll();
    if (data.sp) spCheckAll();
  }

  const overallScore = useMemo(() => {
    const scores = [lv1Score, lv2Score, lv3Score, spScore].filter(Boolean) as { correct: number; total: number }[];
    if (scores.length === 0) return null;
    return scores.reduce(
      (acc, s) => ({ correct: acc.correct + s.correct, total: acc.total + s.total }),
      { correct: 0, total: 0 },
    );
  }, [lv1Score, lv2Score, lv3Score, spScore]);

  const sections = [
    { id: "lv1", label: "LV Teil 1", enabled: Boolean(data.lv1) },
    { id: "lv2", label: "LV Teil 2", enabled: Boolean(data.lv2) },
    { id: "lv3", label: "LV Teil 3", enabled: Boolean(data.lv3) },
    { id: "sp", label: "Sprachbausteine", enabled: Boolean(data.sp) },
  ];

  // Render a section by id
  function renderSection(id: string, compact = false, isSplit = false) {
    const cls = compact ? "h-full overflow-y-auto" : "";
    const effectiveSplit = isSplit && id !== "sp";
    switch (id as SectionId) {
      case "lv1":
        return data.lv1 ? (
          <div className={cls}>
            <LV1Section
              data={data.lv1}
              answers={lv1Answers}
              marks={lv1Marks as Record<string, "ok" | "bad">}
              onPlace={lv1Place}
              onRemove={lv1Remove}
              onCheckOne={lv1CheckOne}
              onCheckAll={lv1CheckAll}
              onReset={() => { setLv1Answers({}); setLv1Marks({}); setLv1Score(null); }}
              score={lv1Score}
              splitView={effectiveSplit}
            />
          </div>
        ) : null;
      case "lv2":
        return data.lv2 ? (
          <div className={cls}>
            <LV2Section
              data={data.lv2}
              answers={lv2Answers}
              marks={lv2Marks as Record<number, "ok" | "bad">}
              onAnswer={lv2Answer}
              onCheckOne={lv2CheckOne}
              onCheckAll={lv2CheckAll}
              onReset={() => { setLv2Answers({}); setLv2Marks({}); setLv2Score(null); }}
              score={lv2Score}
              splitView={effectiveSplit}
            />
          </div>
        ) : null;
      case "lv3":
        return data.lv3 ? (
          <div className={cls}>
            <LV3Section
              data={data.lv3}
              answers={lv3Answers}
              marks={lv3Marks as Record<number, "ok" | "bad">}
              heading={lv3Heading}
              headingMark={lv3HeadingMark}
              onAnswer={lv3Answer}
              onCheckOne={lv3CheckOne}
              onCheckHeading={lv3CheckHeading}
              onHeading={(v) => { setLv3Heading(v); setLv3HeadingMark(null); }}
              onCheckAll={lv3CheckAll}
              onReset={() => { setLv3Answers({}); setLv3Marks({}); setLv3Heading(null); setLv3HeadingMark(null); setLv3Score(null); }}
              score={lv3Score}
              splitView={effectiveSplit}
            />
          </div>
        ) : null;
      case "sp":
        return data.sp ? (
          <div className={cls}>
            <SPSection
              data={data.sp}
              answers={spAnswers}
              marks={spMarks as Record<string, "ok" | "bad">}
              onAnswer={spAnswer}
              onCheckOne={spCheckOne}
              onCheckAll={spCheckAll}
              onReset={() => { setSpAnswers({}); setSpMarks({}); setSpScore(null); }}
              score={spScore}
              splitView={false}
            />
          </div>
        ) : null;
      default:
        return null;
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <Header
        theme={theme}
        onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        reading={reading}
        onToggleReading={() => setReading((r) => !r)}
        onFileUpload={handleFileUpload}
        fileName={fileName}
        onCheckAll={checkAll}
        onResetAll={resetAllAnswers}
        overallScore={overallScore}
        sections={sections}
        splitView={splitView}
        onToggleSplitView={() => setSplitView((v) => !v)}
      />

      <main className="mx-auto max-w-full px-4 py-8 sm:px-6">
        {error && (
          <div className="mx-auto mb-6 max-w-5xl ui-text rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-300">
            {error}
          </div>
        )}

        {!data.lv1 && !data.lv2 && !data.lv3 && !data.sp && (
          <div className="mx-auto max-w-5xl ui-text rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Görüntülenecek alıştırma bulunamadı. Sağ üstten kendi JSON dosyanı yükleyebilirsin.
          </div>
        )}

        <div className="mx-auto max-w-5xl space-y-8">
          {(SECTION_IDS as readonly string[]).map((id) => (
            <div key={id}>{renderSection(id, false, splitView)}</div>
          ))}
        </div>

        <footer className="ui-text py-6 text-center text-xs text-slate-400 dark:text-slate-600">
          telc C1 Trainer · tüm veriler tarayıcında kalır, internet bağlantısı gerekmez.
        </footer>
      </main>
    </div>
  );
}
