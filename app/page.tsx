"use client";

export default function HomePage() {
  return (
    <div className="max-w-3xl mx-auto p-12 text-center">
      <h1 className="text-4xl font-bold tracking-tight mb-6">
        Willkommen bei Confix
      </h1>

      <p className="text-gray-600 text-lg leading-relaxed mb-10">
        Dein smarter Assistent für die Analyse des CMDB- und SACM-Reifegrads.
        Beantworte 10 kurze Fragen und erhalte sofort eine strukturierte
        Bewertung inklusive Risiken und konkreten Empfehlungen.
      </p>

      <a
        href="/analyse"
        className="inline-block px-8 py-4 bg-black text-white rounded-xl text-lg font-semibold shadow hover:bg-gray-900 transition"
      >
        Analyse starten →
      </a>
    </div>
  );
}
