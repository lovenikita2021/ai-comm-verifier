import { useCallback, useEffect, useRef, useState } from "react";
import {
  Shield, ShieldCheck, Settings, X, Check, Search, FileSearch, GraduationCap,
  TriangleAlert, OctagonAlert, CircleCheck, CircleX, CircleHelp, ArrowRight,
  Info, LoaderCircle, Keyboard,
} from "lucide-react";
import { LANGUAGES, translations, SCENARIO_ANSWERS } from "./translations";

const VIEWS = [
  { id: "verify", key: "1", Icon: ShieldCheck },
  { id: "check", key: "2", Icon: Search },
  { id: "analyze", key: "3", Icon: FileSearch },
  { id: "simulate", key: "4", Icon: GraduationCap },
];

const RISK = {
  low: { Icon: CircleCheck, badge: "bg-emerald-50 text-emerald-800 ring-emerald-600", bar: "bg-emerald-600" },
  caution: { Icon: TriangleAlert, badge: "bg-amber-50 text-amber-900 ring-amber-500", bar: "bg-amber-500" },
  high: { Icon: OctagonAlert, badge: "bg-red-50 text-red-800 ring-red-600", bar: "bg-red-600" },
};

const EMPTY_DRAFT = { channel: "email", sender: "", text: "", sampleId: null };

/**
 * STEP 2: replace the body of this function with a call to your backend,
 * which then calls the AI provider. Never put an API key in this file.
 * Return { isSample: false, report: { risk, summary, signs: [{title, why}], missing: [], steps: [] } }.
 */
async function analyzeMessage({ text, channel, sender, language, sampleId }) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return { isSample: true, sampleId: sampleId ?? "high" };
}

function isTypingTarget(el) {
  return !!el && (el.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName));
}

function readSavedLanguage() {
  try {
    const saved = window.localStorage.getItem("vd-lang");
    return translations[saved] ? saved : "en";
  } catch {
    return "en";
  }
}

const card = "rounded-lg border border-slate-200 bg-white p-5 sm:p-6";
const focus = "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600";
const primary = `inline-flex items-center justify-center gap-2 rounded-md bg-[#0b1f3a] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#16345c] disabled:opacity-60 ${focus}`;
const secondary = `inline-flex items-center justify-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 ${focus}`;
const field = `w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-base text-slate-900 placeholder:text-slate-500 ${focus}`;
const h2 = "text-base font-semibold text-slate-900";

function KeyCap({ children, active }) {
  return (
    <kbd
      aria-hidden="true"
      className={`inline-flex h-5 min-w-5 items-center justify-center rounded border border-b-2 px-1 font-mono text-[11px] font-semibold ${
        active ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-slate-300 bg-slate-50 text-slate-600"
      }`}
    >
      {children}
    </kbd>
  );
}

function PageHead({ title, sub }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold text-[#0b1f3a] sm:text-3xl">{title}</h1>
      {sub && <p className="max-w-2xl text-slate-600">{sub}</p>}
    </div>
  );
}

function RiskBadge({ level, t, large }) {
  const { Icon, badge } = RISK[level];
  return (
    <span className={`inline-flex shrink-0 items-center gap-1.5 rounded-full font-semibold ring-1 ${badge} ${large ? "px-4 py-2 text-lg" : "px-2.5 py-1 text-xs"}`}>
      <Icon className={large ? "h-5 w-5" : "h-3.5 w-3.5"} aria-hidden="true" />
      {t.analyze.risk[level]}
    </span>
  );
}

function VerifyView({ t, draft, setDraft, runCheck, busy, error, go, openSample }) {
  const text = draft.sampleId ? t.samples[draft.sampleId].body : draft.text;
  const stats = [["checked", "128"], ["flagged", "9"], ["training", "74%"]];
  return (
    <div className="space-y-6">
      <PageHead title={t.verify.title} sub={t.verify.sub} />
      <form className={`${card} space-y-3`} onSubmit={(e) => { e.preventDefault(); runCheck(); }}>
        <label htmlFor="quick" className={`block ${h2}`}>{t.verify.quickLabel}</label>
        <textarea id="quick" rows={3} className={field} placeholder={t.verify.placeholder} value={text}
          onChange={(e) => setDraft({ ...draft, text: e.target.value, sender: draft.sampleId ? "" : draft.sender, sampleId: null })} />
        {error && <p role="alert" className="text-sm font-medium text-red-700">{t.check.empty}</p>}
        <div className="flex flex-wrap gap-3">
          <button type="submit" className={primary} disabled={busy}>
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
            {busy ? t.check.running : t.verify.run}
          </button>
          <button type="button" className={secondary} onClick={() => go("check")}>
            {t.verify.fullForm}<ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>

      <section className="space-y-3">
        <h2 className={h2}>{t.verify.statsTitle}</h2>
        <dl className="grid gap-px overflow-hidden rounded-lg border border-slate-200 bg-slate-200 sm:grid-cols-3">
          {stats.map(([id, value]) => (
            <div key={id} className="flex flex-col-reverse bg-white p-5">
              <dt className="text-sm text-slate-600">{t.verify.stats[id]}</dt>
              <dd className="text-3xl font-bold tabular-nums text-[#0b1f3a]">{value}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className={`${card} lg:col-span-2`}>
          <h2 className={h2}>{t.verify.recent}</h2>
          <ul className="mt-2 divide-y divide-slate-100">
            {["high", "caution", "low"].map((id) => (
              <li key={id}>
                <button type="button" onClick={() => openSample(id)} className={`flex w-full flex-wrap items-center justify-between gap-2 rounded py-3 text-left hover:bg-slate-50 ${focus}`}>
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-900">{t.samples[id].name}</span>
                    <span className="block break-all text-sm text-slate-500">{t.samples[id].sender}</span>
                  </span>
                  <span className="flex items-center gap-3">
                    <RiskBadge level={id} t={t} />
                    <ArrowRight className="h-4 w-4 text-slate-400" aria-label={t.verify.open} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
        <section className="flex flex-col items-start gap-3 rounded-lg bg-[#0b1f3a] p-6 text-white">
          <GraduationCap className="h-7 w-7 text-sky-300" aria-hidden="true" />
          <h2 className="text-lg font-semibold">{t.verify.practiceTitle}</h2>
          <p className="text-sm text-slate-300">{t.verify.practiceText}</p>
          <button type="button" className={`${secondary} mt-auto`} onClick={() => go("simulate")}>{t.verify.practiceButton}</button>
        </section>
      </div>
    </div>
  );
}

function CheckView({ t, draft, setDraft, runCheck, busy, error }) {
  const sample = draft.sampleId ? t.samples[draft.sampleId] : null;
  const text = sample ? sample.body : draft.text;
  // Editing any part of a sample turns it into the user's own draft.
  const edit = (patch) => setDraft({ ...draft, text, sender: sample ? sample.sender : draft.sender, sampleId: null, ...patch });
  return (
    <div className="space-y-6">
      <PageHead title={t.check.title} sub={t.check.sub} />
      <div className="grid items-start gap-6 lg:grid-cols-3">
        <form className={`${card} space-y-5 lg:col-span-2`} onSubmit={(e) => { e.preventDefault(); runCheck(); }}>
          <fieldset>
            <legend className="mb-2 text-sm font-semibold">{t.check.channel}</legend>
            <div className="flex flex-wrap gap-2">
              {["email", "text", "chat"].map((c) => (
                <button key={c} type="button" aria-pressed={draft.channel === c} onClick={() => setDraft({ ...draft, channel: c })}
                  className={`rounded-md border px-4 py-2 text-sm font-medium ${focus} ${draft.channel === c ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
                  {t.check.channels[c]}
                </button>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="sender" className="mb-2 block text-sm font-semibold">{t.check.sender}</label>
            <input id="sender" className={field} placeholder={t.check.senderPh} value={sample ? sample.sender : draft.sender}
              onChange={(e) => edit({ sender: e.target.value })} />
          </div>
          <div>
            <label htmlFor="body" className="mb-2 block text-sm font-semibold">{t.check.body}</label>
            <textarea id="body" rows={9} className={field} placeholder={t.check.bodyPh} value={text}
              onChange={(e) => edit({ text: e.target.value })} />
          </div>
          {error && <p role="alert" className="text-sm font-medium text-red-700">{t.check.empty}</p>}
          <div className="flex flex-wrap gap-3">
            <button type="submit" className={primary} disabled={busy}>
              {busy ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
              {busy ? t.check.running : t.check.run}
            </button>
            <button type="button" className={secondary} onClick={() => setDraft(EMPTY_DRAFT)}>{t.check.clear}</button>
          </div>
        </form>
        <aside className="space-y-6">
          <section className={`${card} space-y-3`}>
            <h2 className={h2}>{t.check.samples}</h2>
            {[["high", "email"], ["caution", "text"], ["low", "email"]].map(([id, channel]) => (
              <button key={id} type="button" aria-pressed={draft.sampleId === id} className={`${secondary} w-full !justify-between text-left`}
                onClick={() => setDraft({ channel, sender: "", text: "", sampleId: id })}>
                {t.samples[id].name}<ArrowRight className="h-4 w-4 shrink-0" />
              </button>
            ))}
          </section>
          <section className={`${card} space-y-3`}>
            <h2 className={h2}>{t.check.safetyTitle}</h2>
            <ul className="space-y-2 text-sm text-slate-700">
              {t.check.safety.map((tip) => (
                <li key={tip} className="flex gap-2"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#0b1f3a]" />{tip}</li>
              ))}
            </ul>
          </section>
        </aside>
      </div>
    </div>
  );
}

function AnalyzeView({ t, result, openSample, checked, toggle, go }) {
  const report = result.report ?? t.reports[result.sampleId];
  const level = report.risk ?? result.sampleId;
  const done = report.steps.filter((_, i) => checked[i]).length;
  return (
    <div className="space-y-6">
      <PageHead title={t.analyze.title} />
      {result.isSample && (
        <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <p className="flex gap-2 text-sm font-medium text-blue-900"><Info className="mt-0.5 h-4 w-4 shrink-0" />{t.analyze.demo}</p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-blue-900">{t.analyze.sampleSwitch}:</span>
            {["low", "caution", "high"].map((id) => (
              <button key={id} type="button" aria-pressed={result.sampleId === id} onClick={() => openSample(id)}
                className={`rounded-md border px-3 py-1.5 text-sm font-medium ${focus} ${result.sampleId === id ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-blue-200 bg-white text-slate-800"}`}>
                {t.analyze.risk[id]}
              </button>
            ))}
          </div>
        </div>
      )}

      <section className={`${card} space-y-4`} aria-live="polite">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-sm font-semibold text-slate-600">{t.analyze.riskLabel}</span>
          <RiskBadge level={level} t={t} large />
        </div>
        <div className="grid grid-cols-3 gap-1" aria-hidden="true">
          {["low", "caution", "high"].map((id) => (
            <div key={id} className={`h-2 rounded-sm ${id === level ? RISK[id].bar : "bg-slate-200"}`} />
          ))}
        </div>
        <p className="text-lg text-slate-800">{report.summary}</p>
      </section>

      <div className="grid items-start gap-6 lg:grid-cols-5">
        <section className={`${card} lg:col-span-3`}>
          <h2 className={h2}>{t.analyze.signs} ({report.signs.length})</h2>
          {report.signs.length === 0 && <p className="mt-3 text-slate-600">{t.analyze.noSigns}</p>}
          <ul className="mt-2 divide-y divide-slate-100">
            {report.signs.map((s) => (
              <li key={s.title} className="flex gap-3 py-4">
                <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" aria-hidden="true" />
                <div>
                  <h3 className="font-semibold text-slate-900">{s.title}</h3>
                  <p className="mt-1 text-sm text-slate-600"><strong className="font-semibold text-slate-800">{t.analyze.why}: </strong>{s.why}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
        <div className="space-y-6 lg:col-span-2">
          <section className={`${card} space-y-3`}>
            <h2 className={h2}>{t.analyze.missing}</h2>
            <ul className="space-y-2">
              {report.missing.map((m) => (
                <li key={m} className="flex gap-2 text-sm text-slate-700"><CircleHelp className="mt-0.5 h-4 w-4 shrink-0 text-slate-500" />{m}</li>
              ))}
            </ul>
          </section>
          <section className={`${card} space-y-3`}>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className={h2}>{t.analyze.steps}</h2>
              <span className="text-sm tabular-nums text-slate-600">{done}/{report.steps.length} {t.analyze.done}</span>
            </div>
            <ul className="space-y-1">
              {report.steps.map((step, i) => (
                <li key={step}>
                  <label className="flex cursor-pointer items-start gap-3 rounded-md p-2 hover:bg-slate-50">
                    {/* Checkboxes are inputs, so the key listener blurs them after a click. */}
                    <input type="checkbox" className="mt-1 h-4 w-4 shrink-0 accent-[#0b1f3a]" checked={!!checked[i]}
                      onChange={(e) => { toggle(i); e.target.blur(); }} />
                    <span className={`text-sm ${checked[i] ? "text-slate-500 line-through" : "text-slate-800"}`}>{step}</span>
                  </label>
                </li>
              ))}
            </ul>
          </section>
          <button type="button" className={`${primary} w-full`} onClick={() => go("check")}>{t.analyze.another}</button>
        </div>
      </div>
    </div>
  );
}

function SimulateView({ t, training, setTraining }) {
  const { index, answers } = training;
  const scenario = t.scenarios[index];
  const picked = answers[index];
  const answered = picked !== undefined;
  const correct = picked === SCENARIO_ANSWERS[index];
  const score = SCENARIO_ANSWERS.filter((a, i) => answers[i] === a).length;
  const last = index === t.scenarios.length - 1;
  return (
    <div className="space-y-6">
      <PageHead title={t.simulate.title} sub={t.simulate.sub} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {t.scenarios.map((s, i) => (
            <button key={i} type="button" aria-pressed={i === index} onClick={() => setTraining({ ...training, index: i })}
              className={`inline-flex items-center gap-1.5 rounded-md border px-3 py-2 text-sm font-medium ${focus} ${i === index ? "border-[#0b1f3a] bg-[#0b1f3a] text-white" : "border-slate-300 bg-white text-slate-700"}`}>
              {t.simulate.scenario} {i + 1}
              {answers[i] !== undefined && (answers[i] === SCENARIO_ANSWERS[i] ? <CircleCheck className="h-4 w-4" /> : <CircleX className="h-4 w-4" />)}
            </button>
          ))}
        </div>
        <p className="font-semibold tabular-nums text-[#0b1f3a]">{t.simulate.score}: {score}/{t.scenarios.length}</p>
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-2">
        <article className={`${card} space-y-3`}>
          <h2 className={h2}>{scenario.type}</h2>
          <p className="break-all text-sm text-slate-500">{t.simulate.from}: {scenario.from}</p>
          <p className="rounded-md bg-slate-100 p-4 text-lg leading-relaxed text-slate-900">{scenario.message}</p>
        </article>
        <section className={`${card} space-y-3`}>
          <h2 className={h2}>{t.simulate.question}</h2>
          {scenario.options.map((option, i) => {
            const isRight = answered && i === SCENARIO_ANSWERS[index];
            const isWrong = answered && i === picked && !isRight;
            return (
              <button key={i} type="button" disabled={answered}
                onClick={() => setTraining({ ...training, answers: { ...answers, [index]: i } })}
                className={`flex w-full items-center justify-between gap-3 rounded-md border p-3.5 text-left text-sm font-medium ${focus} ${
                  isRight ? "border-emerald-600 bg-emerald-50 text-emerald-900"
                  : isWrong ? "border-red-600 bg-red-50 text-red-900"
                  : "border-slate-300 bg-white text-slate-800 enabled:hover:border-[#0b1f3a]"}`}>
                {option}
                {isRight && <Check className="h-5 w-5 shrink-0" />}
                {isWrong && <X className="h-5 w-5 shrink-0" />}
              </button>
            );
          })}
          {answered && (
            <div role="status" className="space-y-3 border-t border-slate-200 pt-4">
              <p className={`font-semibold ${correct ? "text-emerald-800" : "text-red-800"}`}>{correct ? t.simulate.correct : t.simulate.wrong}</p>
              <p className="text-sm text-slate-700">{scenario.explain}</p>
              <div className="flex flex-wrap gap-3">
                {!last && <button type="button" className={primary} onClick={() => setTraining({ ...training, index: index + 1 })}>{t.simulate.next}<ArrowRight className="h-4 w-4" /></button>}
                <button type="button" className={secondary} onClick={() => setTraining({ index: 0, answers: {} })}>{t.simulate.restart}</button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function LanguageModal({ t, lang, setLang, onClose }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);
  return (
    <dialog ref={ref} onClose={onClose} aria-labelledby="lang-title"
      onClick={(e) => e.target === ref.current && ref.current.close()}
      className="m-auto w-[min(26rem,calc(100%-2rem))] rounded-lg bg-white p-0 text-slate-900 shadow-2xl backdrop:bg-slate-900/60">
      <div className="space-y-4 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="lang-title" className="text-lg font-bold text-[#0b1f3a]">{t.languageTitle}</h2>
            <p className="text-sm text-slate-600">{t.languageHelp}</p>
          </div>
          <button type="button" onClick={() => ref.current.close()} aria-label={t.close} className={`rounded p-1 hover:bg-slate-100 ${focus}`}><X className="h-5 w-5" /></button>
        </div>
        <div className="space-y-2">
          {LANGUAGES.map((l) => (
            <button key={l.code} type="button" aria-pressed={lang === l.code} onClick={() => setLang(l.code)}
              className={`flex w-full items-center justify-between rounded-md border px-4 py-3 text-left ${focus} ${lang === l.code ? "border-[#0b1f3a] bg-slate-100" : "border-slate-200 hover:bg-slate-50"}`}>
              <span>
                <span lang={l.code} className="block font-semibold">{l.native}</span>
                <span className="block text-xs text-slate-500">{l.english}</span>
              </span>
              {lang === l.code && <Check className="h-5 w-5 text-[#0b1f3a]" />}
            </button>
          ))}
        </div>
        <button type="button" className={`${primary} w-full`} onClick={() => ref.current.close()}>{t.close}</button>
      </div>
    </dialog>
  );
}

export default function App() {
  const [lang, setLang] = useState(readSavedLanguage);
  const [view, setView] = useState("verify");
  const [modalOpen, setModalOpen] = useState(false);
  const [typing, setTyping] = useState(false);
  const [draft, setDraftState] = useState(EMPTY_DRAFT);
  const [result, setResult] = useState({ isSample: true, sampleId: "high" });
  const [checked, setChecked] = useState({});
  const [training, setTraining] = useState({ index: 0, answers: {} });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);
  const requestId = useRef(0);
  const t = translations[lang];

  const go = useCallback((next) => {
    // Drop focus so a field on the old view can't keep the keys paused.
    document.activeElement?.blur?.();
    setTyping(false);
    setError(false);
    setView(next);
    window.scrollTo(0, 0);
  }, []);

  // Global macropad listener: keys 1-4 switch views, except while typing.
  useEffect(() => {
    function onKeyDown(e) {
      if (e.key === "Escape" && isTypingTarget(e.target)) { e.target.blur(); return; }
      if (modalOpen || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      if (isTypingTarget(e.target)) return;
      // e.code covers number pads and layouts such as French AZERTY, where the
      // physical 1-4 keys type other characters.
      const physical = !e.shiftKey && /^(?:Digit|Numpad)([1-4])$/.exec(e.code);
      const pressed = physical ? physical[1] : e.key;
      const match = VIEWS.find((v) => v.key === pressed);
      if (!match) return;
      e.preventDefault();
      requestId.current += 1; // a manual switch cancels a pending redirect
      setBusy(false);
      go(match.id);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalOpen, go]);

  useEffect(() => {
    const update = () => setTimeout(() => {
      const el = document.activeElement;
      setTyping(isTypingTarget(el) && el.type !== "checkbox");
    }, 0);
    document.addEventListener("focusin", update);
    document.addEventListener("focusout", update);
    return () => {
      document.removeEventListener("focusin", update);
      document.removeEventListener("focusout", update);
    };
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    try { window.localStorage.setItem("vd-lang", lang); } catch { /* storage unavailable */ }
  }, [lang]);

  const setDraft = (next) => { setError(false); setDraftState(next); };

  const openSample = (id) => {
    requestId.current += 1;
    setBusy(false);
    setResult({ isSample: true, sampleId: id });
    setChecked({});
    go("analyze");
  };

  const runCheck = async () => {
    const text = draft.sampleId ? t.samples[draft.sampleId].body : draft.text;
    if (!text.trim()) { setError(true); return; }
    const id = ++requestId.current;
    setBusy(true);
    const response = await analyzeMessage({ ...draft, text, language: lang });
    if (id !== requestId.current) return;
    setBusy(false);
    setResult(response);
    setChecked({});
    go("analyze");
  };

  const tab = (v) => {
    const active = view === v.id;
    return (
      <button key={v.id} type="button" onClick={() => go(v.id)} aria-current={active ? "page" : undefined}
        aria-keyshortcuts={v.key} title={`${t.keys.key} ${v.key}`}
        className={`flex min-w-0 items-center justify-between gap-2 border-b-[3px] px-2 py-3 text-sm font-semibold sm:px-3 ${focus} ${active ? "border-[#0b1f3a] text-[#0b1f3a]" : "border-transparent text-slate-600 hover:text-slate-900"}`}>
        <span className="flex min-w-0 items-center gap-2"><v.Icon className="h-4 w-4 shrink-0" /><span className="text-left">{t.nav[v.id]}</span></span>
        <KeyCap active={active}>{v.key}</KeyCap>
      </button>
    );
  };

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 font-sans text-slate-900 [color-scheme:light]">
      <header>
        <div className="bg-[#0b1f3a] text-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <ShieldCheck className="h-8 w-8 shrink-0 text-sky-300" aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-lg font-bold leading-tight">VerifyDesk</p>
                <p className="text-xs text-slate-300">{t.tagline}</p>
              </div>
            </div>
            <button type="button" onClick={() => setModalOpen(true)} aria-label={t.settings}
              className="flex shrink-0 items-center gap-2 rounded-md border border-white/25 p-2 text-sm font-medium hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-sky-300 sm:px-3">
              <Settings className="h-5 w-5" /><span className="hidden sm:inline">{t.settings}</span>
            </button>
          </div>
        </div>
        <nav className="border-b border-slate-200 bg-white">
          <div className="mx-auto grid max-w-6xl grid-cols-2 px-2 md:grid-cols-4">{VIEWS.map((v) => tab(v))}</div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {view === "verify" && <VerifyView t={t} draft={draft} setDraft={setDraft} runCheck={runCheck} busy={busy} error={error} go={go} openSample={openSample} />}
        {view === "check" && <CheckView t={t} draft={draft} setDraft={setDraft} runCheck={runCheck} busy={busy} error={error} />}
        {view === "analyze" && <AnalyzeView t={t} result={result} openSample={openSample} checked={checked} toggle={(i) => setChecked((c) => ({ ...c, [i]: !c[i] }))} go={go} />}
        {view === "simulate" && <SimulateView t={t} training={training} setTraining={setTraining} />}
      </main>

      <footer className="sticky bottom-0 pb-[env(safe-area-inset-bottom,0px)] border-t border-slate-200 bg-white">
        <p role="status" className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-2 text-xs text-slate-600">
          <Keyboard className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="flex-1">{typing ? t.keys.paused : t.keys.hint}</span>
          <span className="flex gap-1">{VIEWS.map((v) => <KeyCap key={v.id} active={!typing && view === v.id}>{v.key}</KeyCap>)}</span>
        </p>
      </footer>

      {modalOpen && <LanguageModal t={t} lang={lang} setLang={setLang} onClose={() => setModalOpen(false)} />}
    </div>
  );
}
