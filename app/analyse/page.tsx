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
  <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-8">

    {/* Titel + Maturity Badge */}
    <div className="flex items-center justify-between">
      <h2 className="text-2xl font-bold">Analyse Ergebnis</h2>
      <span className="px-4 py-2 rounded-full text-white text-sm font-semibold bg-black">
        {result.maturity_level}
      </span>
    </div>

    {/* Score-Balken */}
    <div className="space-y-6">
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
              <span className="font-medium">{label}</span>
              <span className="text-gray-600">{pct}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded h-4">
              <div
                className={`h-4 rounded ${color}`}
                style={{ width: `${pct}%` }}
              ></div>
            </div>
          </div>
        );
      })}
    </div>

    {/* Risiken */}
    <div>
      <h3 className="text-xl font-semibold mb-3">Risiken</h3>
      <div className="space-y-3">
        {result.risks.map((risk: string, i: number) => (
          <div key={i} className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="text-red-700 font-medium">⚠️ {risk}</div>
          </div>
        ))}
      </div>
    </div>

    {/* Empfehlungen */}
    <div>
      <h3 className="text-xl font-semibold mb-3">Top-Empfehlungen</h3>
      <div className="space-y-3">
        {result.recommendations.map((rec: any, i: number) => (
          <div key={i} className="p-4 bg-gray-100 border rounded-lg">
            <div className="font-semibold mb-1">Priorität {rec.prio}</div>
            <div className="text-gray-700">{rec.text}</div>
          </div>
        ))}
      </div>
    </div>

  </div>
)}


