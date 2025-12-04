"use client";

import { useState, useEffect } from "react";

export default function AnalysePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  async function submit() {
    const unanswered = questions.some((q) => !answers[q.id]);
    if (unanswered) {
      alert("Bitte alle Fragen beantworten.");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "API nicht erreichbar", details: String(err) });
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white py-6">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold tracking-tight">CMDB Analyse – 10 Fragen</h1>
          <p className="text-gray-500 mt-1">
            Beantworte die folgenden Fragen für eine erste Bewertung deiner CMDB-Reife.
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        {/* Fragenliste */}
        <div className="space-y-8">
          {questions.map((q, index) => (
            <div
              key={q.id}
              className="bg-white shadow-sm rounded-xl p-6 border border-gray-200"
            >
              {/* Frage-Nr */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-semibold text-gray-400">
                  Frage {index + 1} / {questions.length}
                </span>
              </div>

              {/* Text */}
              <h2 className="text-lg font-medium mb-4 text-gray-900">{q.text}</h2>

              {/* Auswahl */}
              <select
                value={answers[q.id] || ""}
                onChange={(e) => updateAnswer(q.id, e.target.value)}
                className="w-full p-3 border rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <option value="" disabled>
                  Bitte wählen…
                </option>
                {q.options.map((opt: string) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          ))}
        </div>

        {/* Ergebnis */}
        {result && (
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-bold mb-4">Ergebnis</h2>
            <pre className="text-sm bg-gray-100 p-4 rounded-lg">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </main>

      {/* Sticky Submit */}
      <div className="fixed bottom-0 inset-x-0 bg-white border-t p-4 shadow-lg">
        <div className="max-w-3xl mx-auto flex justify-end">
          <button
            onClick={submit}
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800"
            disabled={loading}
          >
            {loading ? "Analyse läuft…" : "Analyse starten"}
          </button>
        </div>
      </div>
    </div>
  );
}
