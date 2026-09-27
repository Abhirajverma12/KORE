'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, Brain, Zap, ShieldCheck, CreditCard, TrendingUp } from 'lucide-react';

const SAMPLE_PROMPTS = [
  {
    title: 'Staff System Design',
    text: 'Preparing for a Staff Eng system design interview focusing on distributed caching, Redis stampede, and Kafka at scale.',
  },
  {
    title: 'LLM & RAG Architecture',
    text: 'Need guidance on evaluating LLM embeddings, RAG pipeline latency, PyTorch fine-tuning, and vector database benchmarks.',
  },
  {
    title: 'Frontend Performance',
    text: 'Optimizing Next.js App Router Core Web Vitals, streaming SSR, and designing enterprise micro-frontend state management.',
  },
  {
    title: 'Startup Scaling',
    text: 'Scaling engineering from Seed to Series A, hiring first senior managers, and structuring technical roadmaps.',
  },
];

export default function HomePage() {
  const router = useRouter();
  const [queryText, setQueryText] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!queryText.trim()) return;
    router.push(`/match?q=${encodeURIComponent(queryText.trim())}`);
  };

  const handleSelectSample = (sample) => {
    setQueryText(sample);
  };

  return (
    <div className="space-y-16 py-6">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto space-y-6 pt-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-yellow-400/10 border border-yellow-400/30 text-yellow-400 text-xs font-bold shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
          <span>LLM-Powered Query Enhancement & Multi-Factor Matching</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
          Find mentors by{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">
            intent
          </span>
          , not just keywords.
        </h1>

        <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
          Describe your engineering or career challenge in plain language. KORE decomposes your request into structured intent and ranks top mentors with verified track records.
        </p>

        {/* AI Query Input Form */}
        <form onSubmit={handleSubmit} className="relative mt-8 glow-box rounded-3xl bg-zinc-900 border border-yellow-500/40 p-2 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 flex items-center px-4 py-2">
              <Brain className="w-5 h-5 text-yellow-400 shrink-0 mr-3" />
              <input
                type="text"
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                placeholder="e.g. Preparing for Staff System Design on Kafka & Redis caching at scale..."
                className="w-full bg-transparent text-white placeholder-zinc-500 text-sm sm:text-base focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!queryText.trim() || loading}
              className="px-6 py-3.5 rounded-2xl font-black text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 hover:from-yellow-300 hover:to-amber-200 disabled:opacity-50 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <span>Match Mentors</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Sample Prompt Pills */}
        <div className="pt-2">
          <span className="text-xs text-zinc-400 block mb-2.5 font-medium">Try an example intent query:</span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {SAMPLE_PROMPTS.map((sample, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSelectSample(sample.text)}
                className="text-xs bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-yellow-400/50 text-zinc-300 hover:text-yellow-300 px-3.5 py-1.5 rounded-xl transition-all text-left flex items-center gap-1.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                {sample.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 5 Core Modules Section */}
      <div className="pt-12 border-t border-zinc-800">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-white mb-3">Architected for Precision & Speed</h2>
          <p className="text-sm text-zinc-400">5 purpose-built modules working in harmony across the stack.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4">
              <Brain className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">1. Query Enhancement</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              OpenAI extracts technical skills, seniority tier, problem category, and urgency into structured JSON before matching runs.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">2. Multi-Factor Matching</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Composite ranking scores mentors on skill overlap, verified ratings, seniority caliber, and schedule availability.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">3. Sub-200ms Live Chat</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Socket.IO 1:1 messaging with database message persistence, typing indicators, and real-time latency telemetry.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">4. Role-Based Access</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              JWT auth with strict role guards (Mentee, Mentor, Admin) preventing cross-tenant data leakage.
            </p>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 relative overflow-hidden md:col-span-2">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4">
              <CreditCard className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">5. Cryptographic Razorpay Payments</h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Server-side HMAC-SHA256 signature verification gates room access. Live chat remains locked until cryptographic proof confirms payment.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
