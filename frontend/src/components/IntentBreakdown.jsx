'use client';

import React from 'react';
import { Sparkles, Brain, CheckCircle2, Zap, Target, Tag } from 'lucide-react';

export default function IntentBreakdown({ intent, rawText }) {
  if (!intent) return null;

  return (
    <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 backdrop-blur-sm relative overflow-hidden shadow-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              LLM Intent Interpretation
              <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2.5 py-0.5 rounded-full border border-yellow-400/30 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Structured
              </span>
            </h3>
            <p className="text-xs text-zinc-400">Natural language converted into multi-dimensional matching taxonomy</p>
          </div>
        </div>

        <span
          className={`text-xs px-3 py-1 rounded-full font-bold border uppercase tracking-wider ${
            intent.urgency === 'high'
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
              : 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
          }`}
        >
          {intent.urgency || 'medium'} Urgency
        </span>
      </div>

      {/* Refined Goal Statement */}
      <div className="bg-black/70 border border-yellow-500/20 rounded-2xl p-4 mb-5">
        <div className="text-[11px] uppercase tracking-wider text-yellow-400 font-bold mb-1 flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5" /> Synthesized Goal Statement
        </div>
        <p className="text-sm font-medium text-zinc-200 italic">
          "{intent.summaryIntent}"
        </p>
      </div>

      {/* Extracted Attributes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        <div className="bg-black/40 border border-zinc-800 rounded-2xl p-3.5">
          <span className="text-xs text-zinc-400 block mb-1">Target Seniority</span>
          <span className="text-sm font-bold text-yellow-300 flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-yellow-400" />
            {intent.seniorityLevel} Engineer
          </span>
        </div>

        <div className="bg-black/40 border border-zinc-800 rounded-2xl p-3.5">
          <span className="text-xs text-zinc-400 block mb-1">Problem Category</span>
          <span className="text-sm font-bold text-amber-300 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-amber-400" />
            {intent.problemType}
          </span>
        </div>

        <div className="bg-black/40 border border-zinc-800 rounded-2xl p-3.5">
          <span className="text-xs text-zinc-400 block mb-1">Domain & Context</span>
          <span className="text-sm font-bold text-zinc-200">
            {intent.industryContext?.join(', ') || 'High-growth Tech'}
          </span>
        </div>
      </div>

      {/* Skills Extracted */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-zinc-400 block mb-2">Extracted Skill Clusters:</span>
        <div className="flex flex-wrap gap-2">
          {intent.primarySkills?.map((skill, i) => (
            <span
              key={i}
              className="text-xs font-bold px-3 py-1 rounded-xl bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 flex items-center gap-1"
            >
              <CheckCircle2 className="w-3 h-3 text-yellow-400" />
              {skill}
            </span>
          ))}
          {intent.secondarySkills?.map((skill, i) => (
            <span
              key={`sec-${i}`}
              className="text-xs font-medium px-2.5 py-1 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {intent.expectedOutcomes && intent.expectedOutcomes.length > 0 && (
        <div className="pt-3 border-t border-zinc-800">
          <span className="text-xs font-semibold text-zinc-400 block mb-2">Target Session Deliverables:</span>
          <ul className="space-y-1.5">
            {intent.expectedOutcomes.map((outcome, idx) => (
              <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                <span className="text-yellow-400 font-bold">✓</span>
                {outcome}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
