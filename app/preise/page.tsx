"use client";
import Link from "next/link";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-5xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Confix – CMDB Reifegrad-Pakete / Self Assessements
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Wähle das passende Paket für deine Organisation – vom schnellen
            Self-Check bis zum umfassenden Enterprise Assessment inklusive
            detaillierten Empfehlungen.
          </p>
        </div>

        {/* Pricing Grid */}
        <div className="grid gap-8 md:grid-cols-3 items-stretch">
          {/* S – Free */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">S – Quick Check</h2>
            <p className="text-sm text-gray-500 mb-4">
              Einstiegspaket für einen ersten Eindruck des CMDB-Reifegrads.
            </p>

            <div className="mb-4">
              <span className="text-3xl font-bold">0 CHF</span>
              <span className="text-gray-500 text-sm ml-1">/ einmalig</span>
            </div>

            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• 10 Fragen (CMDB & SACM Basics)</li>
              <li>• Sofortige Einstufung des Reifegrads</li>
              <li>• 3 identifizierte Risiken</li>
              <li>• Kurzempfehlung in 1–2 Sätzen</li>
              <li>• Optionaler PDF-Export mit Wasserzeichen</li>
            </ul>

            <div className="mt-auto">
              <Link  href="/analyse?plan=S"
  className="block w-full text-center px-4 py-2 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-100"
>
  Gratis starten
</Link>

            </div>
          </div>

          {/* M – Professional (Empfohlen) */}
          <div className="flex flex-col bg-white border-2 border-blue-600 rounded-2xl p-6 shadow-md relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 text-xs font-semibold bg-blue-600 text-white rounded-full">
              Empfohlen
            </div>

            <h2 className="text-lg font-semibold mb-2">M – Professional</h2>
            <p className="text-sm text-gray-500 mb-4">
              Vertiefte Analyse für Teams, die ihre CMDB gezielt verbessern wollen.
            </p>

            <div className="mb-4">
              <span className="text-3xl font-bold">50 CHF</span>
              <span className="text-gray-500 text-sm ml-1">/ Assessment</span>
            </div>

            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• 25 Fragen (Datenqualität, Prozesse, Governance)</li>
              <li>• Detail-Scores je Dimension (4 Bereiche)</li>
              <li>• 5–8 identifizierte Risiken</li>
              <li>• Top 5 Empfehlungen mit Priorität</li>
              <li>• Vollständiger PDF-Report</li>
              <li>• Geeignet für KMU & ITSM-Teams</li>
            </ul>

            <div className="mt-auto">
              {/* TODO: später auf echten Checkout/Plan verlinken */}
              <a
                href="/analyse"
                className="block w-full text-center px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
              >
                Professional-Assessment starten
              </a>
            </div>
          </div>

          {/* L – Enterprise */}
          <div className="flex flex-col bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-2">L – Enterprise</h2>
            <p className="text-sm text-gray-500 mb-4">
              Umfassendes Assessment für komplexe Umgebungen und Audits.
            </p>

            <div className="mb-4">
              <span className="text-3xl font-bold">250 CHF</span>
              <span className="text-gray-500 text-sm ml-1">/ Assessment</span>
            </div>

            <ul className="text-sm text-gray-700 space-y-2 mb-6">
              <li>• 50 Fragen (vollständiger CMDB/SACM-Check)</li>
              <li>• Detaillierte Prozessreife je Domäne</li>
              <li>• Governance- und Automatisierungs-Index</li>
              <li>• 10–15 Risiken mit Bewertung (Impact/Likelihood)</li>
              <li>• Top 10 Empfehlungen inkl. Aufwand (S/M/L)</li>
              <li>• Erweiterter PDF-Report (Auditor-tauglich)</li>
            </ul>

            <div className="mt-auto space-y-2">
              <a
                href="/analyse"
                className="block w-full text-center px-4 py-2 bg-black text-white rounded-xl text-sm font-medium hover:bg-gray-900"
              >
                Enterprise-Assessment anfragen
              </a>
              <p className="text-[11px] text-gray-500 text-center">
                Optional: Experten-Review und Roadmap als Zusatzleistung.
              </p>
            </div>
          </div>
        </div>

        {/* Hinweis unten */}
        <div className="mt-12 text-center text-xs text-gray-500">
          Preise in CHF, exkl. MwSt. – Confix liefert kein Tool, sondern klare
          Entscheidungsgrundlagen zur Optimierung von CMDB & SACM.
        </div>
      </main>
    </div>
  );
}
