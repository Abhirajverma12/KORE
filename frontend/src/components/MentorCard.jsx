'use client';

import React from 'react';
import { Star, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

export default function MentorCard({ mentor, onSelect }) {
  const isTopMatch = mentor.matchScore >= 90;

  return (
    <div
      className={`relative rounded-3xl border transition-all duration-300 p-6 flex flex-col justify-between ${
        isTopMatch
          ? 'bg-zinc-900 border-yellow-500/50 shadow-2xl shadow-yellow-500/10 hover:border-yellow-400'
          : 'bg-zinc-900/70 border-zinc-800 hover:border-zinc-700'
      }`}
    >
      {isTopMatch && (
        <div className="absolute -top-3 left-6 px-3.5 py-0.5 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-[11px] font-black text-black tracking-wider uppercase shadow-md flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" /> Best Intent Match
        </div>
      )}

      <div>
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3.5">
            <img
              src={mentor.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.name}`}
              alt={mentor.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-500/40 shadow-md"
            />
            <div>
              <h4 className="text-lg font-bold text-white leading-snug flex items-center gap-2">
                {mentor.name}
              </h4>
              <p className="text-xs font-semibold text-yellow-400">{mentor.headline}</p>
              <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                <span className="flex items-center text-yellow-400 font-bold">
                  <Star className="w-3.5 h-3.5 fill-yellow-400 mr-1" />
                  {Number(mentor.ratingAvg).toFixed(2)}
                </span>
                <span>•</span>
                <span>{mentor.totalSessions} sessions</span>
                <span>•</span>
                <span className="text-zinc-300 font-semibold">{mentor.company}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center p-2.5 rounded-2xl bg-black border border-yellow-500/40 text-center min-w-[76px] shadow-inner">
            <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500">
              {mentor.matchScore}%
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-yellow-400/80">Fit Score</span>
          </div>
        </div>

        <p className="text-xs text-zinc-300 line-clamp-2 mb-4 leading-relaxed">
          {mentor.bio}
        </p>

        {mentor.matchBreakdown?.reasons && mentor.matchBreakdown.reasons.length > 0 && (
          <div className="bg-black/60 border border-zinc-800 rounded-2xl p-3 mb-4 space-y-1.5">
            <div className="text-[11px] font-bold text-yellow-400 uppercase tracking-wider">Why KORE matched:</div>
            {mentor.matchBreakdown.reasons.map((reason, idx) => (
              <div key={idx} className="text-xs text-zinc-300 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-yellow-400 mt-0.5 shrink-0" />
                <span>{reason}</span>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-1.5 mb-5">
          {mentor.skills?.slice(0, 5).map((skill, idx) => (
            <span
              key={idx}
              className="text-[11px] font-semibold px-2.5 py-0.5 rounded-lg bg-zinc-800 text-zinc-200 border border-zinc-700/80"
            >
              {skill}
            </span>
          ))}
          {mentor.skills?.length > 5 && (
            <span className="text-[11px] text-zinc-500 self-center">+{mentor.skills.length - 5} more</span>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-zinc-800 flex items-center justify-between">
        <div>
          <span className="text-xs text-zinc-400 block">Session Fee</span>
          <span className="text-lg font-black text-white">
            ₹{Number(mentor.hourlyRate).toLocaleString()}{' '}
            <span className="text-xs font-normal text-zinc-400">/ 60 min</span>
          </span>
        </div>

        <button
          onClick={() => onSelect(mentor)}
          className="px-5 py-2.5 rounded-xl font-black text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 hover:from-yellow-300 hover:to-amber-200 transition-all shadow-md shadow-yellow-500/20 flex items-center gap-2 group cursor-pointer"
        >
          Book Session
          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
