import { Suspense } from "react";
import AnalyseClient from "./AnalyseClient";

export default function AnalysePage() {
  return (
    <Suspense fallback={<div className="max-w-3xl mx-auto p-8">Lade Analyse…</div>}>
      <AnalyseClient />
    </Suspense>
  );
}
