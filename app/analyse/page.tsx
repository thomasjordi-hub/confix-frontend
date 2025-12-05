"use client";

import { useState, useEffect } from "react";

export default function AnalysePage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // -----------------------------
  // Ergebnis stabilisieren
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

  // Fragen laden
  useEffect(() => {
    fetch("/questions.json")
      .then((res) => res.json())
      .then((data) => setQuestions(data))
      .catch(() => setQuestions([]));
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
      console.error("result-area not found!");
      return;
    }

    // WICHTIG: Bibliotheken erst clientseitig laden
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    console.log("Starte Screenshot…");

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });

    console.log("Screenshot fertig");

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

    console.log("PDF erstellt");
  } catch (err) {
    console.error("PDF error:", err);
  }
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

      {/* Button */}
      <button
        onClick={submit}
        className="mt-8 px-6 py-3 bg-black text-white rounded hover:bg-gray-900"
      >
        Analyse starten
      </button>

      {loading && <p className="mt-4">Analyse läuft…</p>}

      {/* Ergebnis */}
      {result && (
        <>
          {/* PDF BUTTON */}
          <button
            onClick={exportPDF}
            className="mt-8 px-6 py-3 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            PDF herunterladen
          </button>

          {/* RESULT AREA */}
          <div id="result-area" className="pdf-safe">
            {/* HEADER CARD */}
            <div className="bg-white border border-gray-200 shadow-lg rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold tracking-tight">
                    Analyse Ergebnis
                  </h2>
                  <p className="text-gray-500 mt-1 text-lg">
                    Zusammengefasste Bewertung deiner CMDB- & SACM-Reife
                  </p>
                </div>

                <span
                  className={`
                    px-6 py-3 text-white text-sm rounded-full font-semibold shadow
                    ${
                      result.maturity_level === "Initial"
                        ? "bg-red-600"
                        : result.maturity_level === "Repeatable"
                        ? "bg-orange-500"
                        : result.maturity_level === "Defined"
                        ? "bg-yellow-500"
                        : result.maturity_level === "Managed"
                        ? "bg-green-600"
                        : "bg-blue-600"
                    }
                  `}
                >
                  {result.maturity_level}
                </span>
              </div>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* LEFT: SCORES */}
              <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
                <h3 className="text-xl font-semibold mb-6">Reifegrad-Scores</h3>

                <div className="space-y-6">
                  {Object.entries(result.scores).map(([key, value]: any) => {
                    const label =
                      key === "data_quality"
                        ? "Datenqualität"
                        : key === "process_maturity"
                        ? "Prozessreife"
                        : key === "automation"
                        ? "Automatisierung"
                        : key === "governance"
                        ? "Governance"
                        : key;

                    const color =
                      value < 40
                        ? "bg-red-500"
                        : value < 70
                        ? "bg-yellow-500"
                        : "bg-green-600";

                    return (
                      <div key={key}>
                        <div className="flex justify-between mb-1">
                          <span className="font-medium">{label}</span>
                          <span className="font-semibold text-gray-700">
                            {value}%
                          </span>
                        </div>

                        <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-3 rounded-full transition-all duration-700 ${color}`}
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* RIGHT: RISKS + RECOMMENDATIONS */}
              <div className="space-y-6">
                {/* Risiken */}
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Identifizierte Risiken
                  </h3>

                  <div className="space-y-4">
                    {result.risks.map((risk: string, i: number) => (
                      <div
                        key={i}
                        className="p-4 bg-red-50 border border-red-200 rounded-xl"
                      >
                        <span className="font-semibold text-red-700">
                          ⚠️ Risiko:
                        </span>
                        <p className="text-red-700 mt-1 leading-relaxed">
                          {risk}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Empfehlungen */}
                <div className="bg-white border border-gray-200 shadow-md rounded-2xl p-6">
                  <h3 className="text-xl font-semibold mb-4">
                    Strategische Empfehlungen
                  </h3>

                  <div className="space-y-4">
                    {result.recommendations.map((rec: any, i: number) => (
                      <div
                        key={i}
                        className="p-4 bg-gray-50 border rounded-xl shadow-sm"
                      >
                        <div className="font-bold mb-1 text-gray-800">
                          Priorität {rec.prio}
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                          {rec.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
