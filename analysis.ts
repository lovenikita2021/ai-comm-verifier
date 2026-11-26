// Shared by the API route and the UI. Contains no secrets.
export const LANGUAGES = ["English", "Spanish", "Chinese", "Hindi", "French"] as const;
export type Language = (typeof LANGUAGES)[number];

export const RISK_LEVELS = ["Low Risk", "Caution", "High Risk"] as const;
export type RiskLevel = (typeof RISK_LEVELS)[number];

export const MAX_MESSAGE_CHARS = 20_000;

export interface AnalysisResult {
  riskLevel: RiskLevel; // always the English value; the UI translates the label
  warningSigns: string[];
  whyItMatters: string[]; // whyItMatters[i] explains warningSigns[i]
  missingInfo: string[];
  recommendedActions: string[];
  disclaimer: string;
}

const ALIASES: Record<string, Language> = {
  english: "English", en: "English",
  spanish: "Spanish", es: "Spanish", "español": "Spanish",
  chinese: "Chinese", zh: "Chinese", "中文": "Chinese",
  hindi: "Hindi", hi: "Hindi", "हिन्दी": "Hindi", "हिंदी": "Hindi",
  french: "French", fr: "French", "français": "French",
};

/** Accepts "Spanish", "es", "es-MX" or "Español". Returns null if unsupported. */
export function toLanguage(value: unknown): Language | null {
  if (typeof value !== "string") return null;
  const key = value.trim().toLowerCase();
  const base = key.split("-")[0];
  return Object.hasOwn(ALIASES, key) ? ALIASES[key]
    : Object.hasOwn(ALIASES, base) ? ALIASES[base] : null;
}

export function isAnalysisResult(v: unknown): v is AnalysisResult {
  if (!v || typeof v !== "object") return false;
  const r = v as Record<string, unknown>;
  const strings = (a: unknown) => Array.isArray(a) && a.every((s) => typeof s === "string");
  return (
    RISK_LEVELS.includes(r.riskLevel as RiskLevel) &&
    strings(r.warningSigns) && strings(r.whyItMatters) &&
    strings(r.missingInfo) && strings(r.recommendedActions) &&
    typeof r.disclaimer === "string"
  );
}
