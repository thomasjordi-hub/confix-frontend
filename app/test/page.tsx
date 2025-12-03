"use client";

import { useState } from "react";

export default function TestPage() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function testApi() {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/score`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            answers: { q1: "yes", q2: "no" }
          }),
        }
      );

      const data = await response.json();
      setResult(data);

    } catch (error) {
      setResult({ error: "API unreachable", details: String(error) });
    }
    
    setLoading(false);
  }

  return (
    <div className="p-10 max-w-2xl mx-auto text-gray-800">
      <h1 className="text-2xl font-bold mb-4">Confix API Test</h1>

      <button
        onClick={testApi}
        className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
      >
        Test API Call
      </button>

      {loading && <p className="mt-4">Sending request…</p>}

      {result && (
        <pre className="mt-6 p-4 bg-gray-100 rounded border text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
