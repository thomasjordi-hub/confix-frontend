"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

type Question = {
  id: string;
  text: string;
  options: string[];
};

type Result = {
  scores: {
    Datenqualität: number;
    Prozessmaturität: number;
    Automatisierung: number;
    Governance: number;
  };
  maturity_level: string;
  risks: string[];
  recommendations: { prio: number; text: string }[];
};

export default function AnalyseClient() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<"S" | "M" | "L">("S");
  const [accessDenied, setAccessDenied] = useState(false);
  
const searchParams = useSearchParams();
const router = useRouter();

const planParam = (searchParams.get("plan") || "S").toUpperCase();
const requestedPlan: "S" | "M" | "L" =
  planParam === "M" || planParam === "L" ? planParam : "S";

  useEffect(() => {
  setPlan(requestedPlan);
}, [requestedPlan]);



  function hasAccess(p: "S" | "M" | "L") {
  if (p === "S") return true;

  const key = p === "M" ? "confix_access_M" : "confix_access_L";
  const expires = Number(localStorage.getItem(key) || 0);

  if (!expires) return false;

  if (Date.now() > expires) {
    localStorage.removeItem(key);
    return false;
  }

  return true;
}

function grantAccess(p: "M" | "L") {
  const key = p === "M" ? "confix_access_M" : "confix_access_L";
  const expires = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 Tage
  localStorage.setItem(key, String(expires));
}

useEffect(() => {
  // Nur im Browser
  if (typeof window === "undefined") return;

  const payment = searchParams.get("payment");

  // Wenn Stripe success redirect: /analyse?plan=M&payment=success
  if (payment === "success" && (plan === "M" || plan === "L")) {
    grantAccess(plan);
    router.replace(`/analyse?plan=${plan}`); // URL säubern
    return;
  }

  // Zugriff prüfen
  if (!hasAccess(plan)) {
    router.replace(`/preise?reason=upgrade_required&plan=${plan}`);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [plan]);

  useEffect(() => {
  (async () => {
    try {
      if (typeof window === "undefined") return;
      if (!hasAccess(plan)) return; // falls Redirect noch läuft

      const file =
        plan === "M"
          ? "/questions-m.json"
          : plan === "L"
          ? "/questions-l.json"
          : "/questions-s.json";

      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setQuestions(Array.isArray(data) ? data : []);
      setAnswers({});
      setResult(null);
      setError(null);
    } catch (e) {
      console.error("questions load failed:", e);
      setQuestions([]);
    }
  })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [plan]);


  // Fragen laden (robust)
useEffect(() => {
  (async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const planRaw = (params.get("plan") || "S").toUpperCase();
      const selected: "S" | "M" | "L" =
        planRaw === "M" || planRaw === "L" ? planRaw : "S";

      // Stripe Success Redirect: payment=success&plan=M|L
      const payment = params.get("payment");
      if (payment === "success" && (selected === "M" || selected === "L")) {
        grantAccess(selected);
        // URL säubern (optional, damit man es nicht dauernd sieht)
        params.delete("payment");
        const clean = `${window.location.pathname}?plan=${selected}`;
        window.history.replaceState({}, "", clean);
      }

      // Access Check
      if (!hasAccess(selected)) {
        setAccessDenied(true);
        // Redirect zu /preise, mit Rücksprung-Link
        window.location.href = `/preise?reason=upgrade_required&plan=${selected}`;
        return;
      }

      setPlan(selected);

      const file =
        selected === "M"
          ? "/questions-m.json"
          : selected === "L"
          ? "/questions-l.json"
          : "/questions-s.json";

      const res = await fetch(file, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      setQuestions(Array.isArray(data) ? data : []);
      setAnswers({});
      setResult(null);
      setError(null);
    } catch (e) {
      console.error("questions load failed:", e);
      setQuestions([]);
    }
  })();
}, []);



  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  const allAnswered = useMemo(() => {
    return (
      questions.length > 0 &&
      questions.every((q) => (answers[q.id] ?? "").trim() !== "")
    );
  }, [questions, answers]);

  function normalizeResult(data: any): Result {
    return {
      scores: {
        data_quality: Number(data?.scores?.data_quality ?? 0),
        process_maturity: Number(data?.scores?.process_maturity ?? 0),
        automation: Number(data?.scores?.automation ?? 0),
        governance: Number(data?.scores?.governance ?? 0),
      },
      maturity_level: data?.maturity_level || "Initial",
      risks: Array.isArray(data?.risks) ? data.risks : [],
      recommendations: Array.isArray(data?.recommendations)
        ? data.recommendations.map((r: any) => ({
            prio: Number(r?.prio ?? 0),
            text: String(r?.text ?? ""),
          }))
        : [],
    };
  }
 function scoreValue(v: string) {
  if (v.includes("Nicht vorhanden")) return 0;
  if (v.includes("Initial")) return 25;
  if (v.includes("Wiederholbar")) return 50;
  if (v.includes("Definiert")) return 75;
  if (v.includes("Optimiert")) return 100;
  return 0;
}


function clamp(n: number) {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function evaluateStaticS(answers: Record<string, string>) {
  // IDs nach Prefix clustern: dq_*, pm_*, au_*, gov_*
  const buckets: Record<string, number[]> = {
    data_quality: [],
    process_maturity: [],
    automation: [],
    governance: [],
  };

  for (const [id, val] of Object.entries(answers)) {
    const s = scoreValue(val);

    if (id.startsWith("dq_")) buckets.data_quality.push(s);
    else if (id.startsWith("pm_")) buckets.process_maturity.push(s);
    else if (id.startsWith("au_")) buckets.automation.push(s);
    else if (id.startsWith("gov_")) buckets.governance.push(s);
    else buckets.process_maturity.push(s); // fallback
  }

  const avg = (arr: number[]) =>
    arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

  const scores = {
    data_quality: clamp(avg(buckets.data_quality)),
    process_maturity: clamp(avg(buckets.process_maturity)),
    automation: clamp(avg(buckets.automation)),
    governance: clamp(avg(buckets.governance)),
  };

  const overall = clamp(
    (scores.data_quality + scores.process_maturity + scores.automation + scores.governance) / 4
  );

  const maturity_level =
    overall < 20 ? "Initial" :
    overall < 40 ? "Repeatable" :
    overall < 60 ? "Defined" :
    overall < 80 ? "Managed" :
    "Optimizing";

  // einfache statische Risiken (ohne AI)
  const risks: string[] = [];
  if (scores.data_quality < 50) risks.push("Niedrige Datenqualität erhöht das Risiko falscher Abhängigkeiten und fehlerhafter Impact-Analysen.");
  if (scores.process_maturity < 50) risks.push("Unklare Prozesse führen zu inkonsistenter CMDB-Pflege und steigenden Betriebskosten.");
  if (scores.governance < 50) risks.push("Fehlende Governance erschwert Verantwortlichkeiten, Auditierbarkeit und nachhaltige Verbesserung.");
  if (scores.automation < 50) risks.push("Geringe Automatisierung erhöht manuellen Aufwand und macht die CMDB schneller veraltet.");

  // min. 3 Risiken liefern (für UI)
  while (risks.length < 3) risks.push("Potenzial für Verbesserungen in CMDB/SACM – vertiefte Analyse empfohlen (M/L).");

  const recommendations = [
    { prio: 1, text: "Definiere Verantwortlichkeiten (CI Owner) und Mindest-Attribute je CI-Klasse – und setze verbindliche Pflege-Regeln." },
    { prio: 2, text: "Führe Data-Quality Checks ein (Vollständigkeit, Aktualität, Dubletten) und etabliere einen Korrektur-Workflow." },
    { prio: 3, text: "Baue eine Service-/Abhängigkeits-Sicht auf (Business Services → CIs) und validiere mit den Fachbereichen." },
  ];

  return { scores, maturity_level, risks: risks.slice(0, 3), recommendations };
}

  async function submit() {
  setError(null);
  setResult(null);

  if (!allAnswered) {
    setError("Bitte beantworte alle Fragen, bevor du die Analyse startest.");
    return;
  }

  // ✅ FREE (S) = statisch encourage upgrade, keine API
  if (plan === "S") {
    const staticResult = evaluateStaticS(answers);
    setResult(staticResult);
    return;
  }

  // ✅ M/L = Backend/OpenAI
  setLoading(true);
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ answers, plan }),
    });

    const data = await res.json();
    setResult(normalizeResult(data));
  } catch (err) {
    setError("API nicht erreichbar.");
    console.error(err);
  } finally {
    setLoading(false);
  }
}


  async function exportPDF() {
    try {
      const element = document.getElementById("result-area");
      if (!element) {
        alert("PDF konnte nicht erstellt werden – kein Ergebnis gefunden.");
        return;
      }

      // Libraries erst im Browser laden
      const html2canvas = (await import("html2canvas")).default;
      const { jsPDF } = await import("jspdf");

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#ffffff",
        useCORS: true,
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "p", unit: "mm", format: "a4" });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
      pdf.save("Confix-Analyse.pdf");
    } catch (e) {
      console.error("PDF error:", e);
      alert("PDF konnte nicht erstellt werden (Details in Konsole).");
    }
  }

  return (
        <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-2">
  CMDB Analyse – {plan} ({questions.length} Fragen)
</h1>
          {accessDenied && (
  <p className="text-sm text-red-600">
    Zugriff auf dieses Paket ist gesperrt. Du wirst zu den Preisen weitergeleitet…
  </p>
)}
      <p className="text-gray-600 mb-8">
        Bitte beantworte alle Fragen. Danach erhältst du Scores, Risiken,
        Empfehlungen und kannst den PDF-Report herunterladen.
      </p>

      {questions.length === 0 && (
        <p className="text-sm text-red-600 mb-6">
          Fragen konnten nicht geladen werden. Prüfe{" "}
          <span className="font-mono">/public/questions.json</span>
        </p>
      )}

      {/* Fragen */}
      <div className="space-y-6">
        {questions.map((q) => {
          const missing = !!error && !(answers[q.id] ?? "").trim();
          return (
            <div key={q.id} id={`q-${q.id}`}>
              <label className="block font-medium mb-2">{q.text}</label>

              <select
                required
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                className={`border rounded w-full p-2 ${
                  missing ? "border-red-500 bg-red-50" : ""
                }`}
                value={answers[q.id] || ""}
              >
                <option value="" disabled>
                  Bitte wählen…
                </option>
                {q.options.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>

              {missing && (
                <div className="text-xs text-red-600 mt-1">
                  Bitte diese Frage beantworten.
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Button */}
      <button
        onClick={submit}
        disabled={!allAnswered || loading}
        className={`mt-8 px-6 py-3 rounded text-white ${
          !allAnswered || loading
            ? "bg-gray-400 cursor-not-allowed"
            : "bg-black hover:bg-gray-900"
        }`}
      >
        {loading ? "Analyse läuft…" : "Analyse starten"}
      </button>

      {error && (
        <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
      )}

      {/* Ergebnis */}
      {result && (
        <div className="mt-12 space-y-6">
          <button
            onClick={exportPDF}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            PDF herunterladen
          </button>

          <div
            id="result-area"
            className="pdf-safe bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Analyse Ergebnis</h2>
              <span className="px-4 py-2 rounded-full text-white text-sm font-semibold bg-black">
                {result.maturity_level}
              </span>
            </div>

            <div className="space-y-4">
              {Object.entries(result.scores).map(([k, v]) => (
                <div key={k}>
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{k}</span>
                    <span className="text-gray-700">{v}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-3 bg-green-600"
                      style={{ width: `${v}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Risiken</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.risks.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-2">Empfehlungen</h3>
              <div className="space-y-2">
                {result.recommendations.map((rec, i) => (
                  <div key={i} className="p-3 bg-gray-50 border rounded-lg">
                    <div className="font-semibold">Priorität {rec.prio}</div>
                    <div className="text-gray-700">{rec.text}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
