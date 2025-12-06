"use client";

import { useState, useEffect } from "react";

export default function AnalysePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Ergebnis normalisieren
  // -----------------------------
  function normalizeResult(data: any) {
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
            text: r?.text ?? "",
          }))
        : [],
    };
  }

  // -----------------------------
  // Fragen laden
  // -----------------------------
  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data));
  }, []);

  // -----------------------------
  // Antwort speichern
  // -----------------------------
  function updateAnswer(id: string, value: string) {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }

  // -----------------------------
  // Analyse an Backend senden
  // -----------------------------
  async function submit() {
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/score`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      const data = await res.json();
      setResult(normalizeResult(data));
    } catch (err) {
      setResult({ error: "API unreachable", details: String(err) });
    }

    setLoading(false);
  }

  // -----------------------------
  // PDF Export
  // -----------------------------
  async function exportPDF() {
  try {
    console.log("PDF Button clicked!");

    const element = document.getElementById("result-area");

    if (!element) {
      console.error("❌ FEHLER: result-area existiert nicht!");
      alert("PDF konnte nicht erstellt werden – kein Inhalt gefunden.");
      return;
    }

    // Dynamisch nur im Browser laden
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    console.log("📸 Screenshot wird erstellt…");

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
      logging: true, // Debug
    });

    console.log("✔ Screenshot erstellt");

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF({
      orientation: "p",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);
    pdf.save("Confix-Analyse.pdf");

    console.log("✔ PDF erfolgreich erstellt!");
  } catch (err) {
    console.error("❌ PDF error:", err);
    alert("PDF konnte nicht erstellt werden (Fehler siehe Konsole).");
  }
}

  // -----------------------------
  // RETURN (UI)
  // -----------------------------
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

      {/* Analyse Button */}
      <button
        onClick={submit}
        className="mt-8 px-6 py-3 bg-black text-white rounded hover:bg-gray-900"
      >
        Analyse starten
      </button>

      {loading && <p className="mt-4">Analyse läuft…</p>}

      {/* Ergebnis */}
      {result && (
        <div className="mt-16 space-y-10">
          {/* PDF Button */}
          <button
            onClick={exportPDF}
            className="px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            PDF herunterladen
          </button>

          {/* Ergebnisbereich */}
          <div id="result-area" className="bg-white p-6 shadow rounded-xl space-y-6">

            {/* Reifegrad */}
            <div className="text-2xl font-bold">
              Ergebnis: {result.maturity_level}
            </div>

            {/* Scores */}
            <div className="space-y-4">
              {Object.entries(result.scores).map(([key, value]: any) => (
                <div key={key}>
                  <div className="flex justify-between">
                    <span>{key}</span>
                    <span>{value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded h-3">
                    <div
                      className="bg-green-600 h-3 rounded"
                      style={{ width: `${value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Risiken */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Risiken</h3>
              <ul className="list-disc list-inside space-y-1">
                {result.risks.map((r: string, i: number) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Empfehlungen */}
            <div>
              <h3 className="text-xl font-semibold mb-2">Empfehlungen</h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec: any, i: number) => (
                  <li key={i}>
                    <strong>Prio {rec.prio}:</strong> {rec.text}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
