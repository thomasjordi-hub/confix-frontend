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
              defaultValue=""
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
        <pre className="mt-6 p-4 bg-gray-100 rounded border text-sm">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
