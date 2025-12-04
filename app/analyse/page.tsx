"use client";

import { useState, useEffect } from "react";

export default function AnalysePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Fragen laden
  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  // Antwort speichern
  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  // API senden
  async function submit() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        }
      );

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "API unreachable", details: String(err) });
    }

    setLoading(false);
  }

  return (
    <div className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">CMDB Analyse – 10 Fragen</h1>

      {/* Fragen */}
      <div className="space-y-6">
        {questions.map((q) => (
          <div key={q.id}>
            <label className="block font-medium mb-2">{q.text}</label>

            <select
              onChange={(e) => updateAnswer(q.id, e.target.value)}
              className="border rounded w-full p-2"
              value={answers[q.id] || ""}
            >
              <option value="" disabled>Bitte wählen…</option>
              {q.options.map((opt: string) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* Button */}
      <button
        onClick={submit}
        className="mt-8 px-6 py-3 bg-black text-white rounded hover:bg-gray-900"
      >
        Analyse starten
      </button>

      {/* Ergebnis */}
      {loading && <p className="mt-4">Analyse läuft…</p>}

      {result && (
  <div className="mt-12 bg-white border border-gray-200 rounded-2xl p-8 shadow-xl space-y-10 animate-fadeIn">

    {/* HEADER */}
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Analyse Ergebnis</h2>
        <p className="text-gray-500 mt-1">Basierend auf deinen Antworten</p>
      </div>

      <span className="px-5 py-2 rounded-full text-white text-sm font-semibold bg-black shadow">
        {result.maturity_level}
      </span>
    </div>

    {/* SECTION: SCORES */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Reifegrad-Scores</h3>
      <div className="space-y-5">
        {Object.entries(result.scores).map(([key, value]: any) => {
          const pct = value;
          const label =
            key === "data_quality" ? "Datenqualität" :
            key === "process_maturity" ? "Prozessreife" :
            key === "automation" ? "Automatisierung" :
            key === "governance" ? "Governance" : key;

          const color =
            pct < 40 ? "bg-red-500" :
            pct < 70 ? "bg-yellow-500" :
            "bg-green-600";

          return (
            <div key={key}>
              <div className="flex justify-between mb-1">
                <span className="font-medium text-gray-800">{label}</span>
                <span className="text-gray-600 font-semibold">{pct}%</span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
                  style={{ width: `${pct}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </section>

    {/* SECTION: RISKS */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Identifizierte Risiken</h3>
      <div className="space-y-4">
        {result.risks.map((risk: string, i: number) => (
          <div
            key={i}
            className="p-5 bg-red-50 border border-red-200 rounded-xl shadow-sm flex items-start gap-3"
          >
            <span className="text-red-600 text-xl">⚠️</span>
            <p className="text-red-700 leading-relaxed">{risk}</p>
          </div>
        ))}
      </div>
    </section>

    {/* SECTION: RECOMMENDATIONS */}
    <section>
      <h3 className="text-xl font-semibold mb-4">Top-Empfehlungen</h3>
      <div className="space-y-4">
        {result.recommendations.map((rec: any, i: number) => (
          <div
            key={i}
            className="p-5 bg-gray-50 border border-gray-300 rounded-xl shadow-sm"
          >
            <div className="font-bold mb-1 text-gray-800">
              Priorität {rec.prio}
            </div>
            <p className="text-gray-700 leading-relaxed">{rec.text}</p>
          </div>
        ))}
      </div>
    </section>

    {/* PDF BUTTON */}
    <div className="pt-4 border-t flex justify-end">
      <button
        onClick={() => downloadPDF(result)}
        className="px-6 py-3 bg-black text-white rounded-lg shadow hover:bg-gray-900 transition"
      >
        PDF herunterladen
      </button>
    </div>

  </div>
)}



