import { Header } from "@/components";
import { Footer } from "@/components";
import OnboardingTour from "@/components/shared/OnboardingTour";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Onboarding tour for first-time users */}
      <OnboardingTour />

      <Header />

      <main
        id="main-content"
        className="flex-1 flex flex-col items-center justify-center px-4 py-16"
      >
        {/* Hero section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/40 border border-violet-800/40 text-violet-300 text-xs font-medium mb-6">
            <span>🔬</span> Soroban Transaction Debugger
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-violet-200 to-violet-400 bg-clip-text text-transparent mb-6">
            🔬 Prism
          </h1>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed mb-8">
            From cryptic error to root cause in one command. Decode, trace, and
            debug Soroban transactions with ease.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/decode"
              data-tour="decode-input"
              className="inline-flex items-center gap-2 px-6 py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold rounded-xl transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              🔍 Decode Error
            </Link>
            <Link
              href="/trace"
              data-tour="trace-tab"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              ▶️ Trace Transaction
            </Link>
            <Link
              href="/debug"
              data-tour="debug-tab"
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl border border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              🐛 Debug
            </Link>
          </div>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl w-full mx-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-violet-800/50 transition-colors">
            <div className="text-2xl mb-3">⚡</div>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              Instant Error Decoding
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Decode Soroban host errors into plain English with suggested fixes.
              Cross-references WASM metadata to resolve custom error codes.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-violet-800/50 transition-colors">
            <div className="text-2xl mb-3">🔄</div>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              Execution Trace Replay
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Replay transactions against historical ledger state. Step through
              execution, set breakpoints, and inspect state changes.
            </p>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-violet-800/50 transition-colors">
            <div className="text-2xl mb-3">📊</div>
            <h2 className="text-base font-bold text-slate-100 mb-2">
              Resource Profiling
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Identify budget hotspots and expensive host function calls before
              deploying to mainnet.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
