'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Sparkles, ArrowRight, Lock, Loader2 } from 'lucide-react';

export default function MenteeDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [queries, setQueries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest('/sessions'),
      apiRequest('/queries/history').catch(() => ({ queries: [] })),
    ])
      .then(([sessionsRes, queriesRes]) => {
        setSessions(sessionsRes.sessions || []);
        setQueries(queriesRes.queries || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading your mentorship dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white">Mentee Control Center</h1>
          <p className="text-xs text-zinc-400">Manage active sessions, chat with mentors, and track past AI matching queries</p>
        </div>
        <Link
          href="/"
          className="px-4 py-2 rounded-xl text-xs font-black text-black bg-yellow-400 hover:bg-yellow-300 transition-all flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Match</span>
        </Link>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-yellow-400" />
          <span>My Mentorship Sessions ({sessions.length})</span>
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center space-y-3">
            <p className="text-sm text-zinc-400">You haven't booked any mentorship sessions yet.</p>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-yellow-400 hover:text-yellow-300"
            >
              <span>Describe your intent to match with a mentor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => {
              const isPaid = sess.status === 'PAID';

              return (
                <div
                  key={sess.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isPaid
                            ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                            : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                        }`}
                      >
                        {sess.status}
                      </span>
                      <span className="text-xs font-bold text-white">
                        ₹{Number(sess.amount).toLocaleString()}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-white mb-2 line-clamp-1">{sess.topic}</h3>

                    <div className="flex items-center gap-3 pt-2 mb-4">
                      <img
                        src={sess.mentor?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sess.mentor?.name}`}
                        alt={sess.mentor?.name}
                        className="w-8 h-8 rounded-full border border-yellow-500/40 object-cover"
                      />
                      <div>
                        <div className="text-xs font-bold text-zinc-200">{sess.mentor?.name}</div>
                        <div className="text-[10px] text-yellow-400 font-semibold">{sess.mentor?.mentorProfile?.headline || 'Tech Mentor'}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                    <span className="text-[11px] text-zinc-400">
                      {new Date(sess.createdAt).toLocaleDateString()}
                    </span>

                    {isPaid ? (
                      <Link
                        href={`/session/${sess.id}/chat`}
                        className="px-3.5 py-1.5 rounded-xl font-black text-xs text-black bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 transition-all flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Open Live Chat</span>
                      </Link>
                    ) : (
                      <Link
                        href={`/session/${sess.id}/chat`}
                        className="px-3.5 py-1.5 rounded-xl font-bold text-xs text-white bg-zinc-800 hover:bg-zinc-700 transition-all flex items-center gap-1.5 border border-zinc-700"
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>Unlock Session</span>
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {queries.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-zinc-800">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            <span>Past AI Query History ({queries.length})</span>
          </h2>

          <div className="space-y-3">
            {queries.map((q) => (
              <div
                key={q.id}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-white">"{q.rawText}"</p>
                  <p className="text-[11px] text-yellow-400">{q.enhancedIntent?.summaryIntent}</p>
                </div>

                <Link
                  href={`/match?q=${encodeURIComponent(q.rawText)}`}
                  className="text-xs font-bold text-yellow-400 hover:text-yellow-300 shrink-0 flex items-center gap-1"
                >
                  <span>Re-match</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
