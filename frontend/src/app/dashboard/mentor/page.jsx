'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { MessageSquare, Star, Loader2 } from 'lucide-react';

export default function MentorDashboard() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest('/sessions')
      .then((res) => {
        setSessions(res.sessions || []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading your mentor dashboard...</p>
      </div>
    );
  }

  const paidSessions = sessions.filter((s) => s.status === 'PAID');
  const totalEarned = paidSessions.reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="space-y-8 py-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}`}
            alt={user?.name}
            className="w-14 h-14 rounded-2xl object-cover border-2 border-yellow-500/50"
          />
          <div>
            <h1 className="text-2xl font-black text-white">{user?.name}</h1>
            <p className="text-xs text-yellow-400 font-semibold">{user?.mentorProfile?.headline || 'Verified Industry Mentor'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs bg-yellow-400/10 text-yellow-400 border border-yellow-400/30 px-3.5 py-1 rounded-full font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
            Accepting Sessions
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <span className="text-xs text-zinc-400 block mb-1">Total Mentorship Earnings</span>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-400">
            ₹{totalEarned.toLocaleString()}
          </div>
          <span className="text-[11px] text-yellow-400 font-semibold">{paidSessions.length} paid sessions completed</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <span className="text-xs text-zinc-400 block mb-1">Mentor Rating</span>
          <div className="text-2xl font-black text-yellow-300 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-yellow-400 text-yellow-400" />
            <span>{Number(user?.mentorProfile?.ratingAvg || 4.98).toFixed(2)}</span>
          </div>
          <span className="text-[11px] text-zinc-400">100% positive feedback score</span>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
          <span className="text-xs text-zinc-400 block mb-1">Hourly Consulting Rate</span>
          <div className="text-2xl font-black text-white">
            ₹{Number(user?.mentorProfile?.hourlyRate || 3000).toLocaleString()}
          </div>
          <span className="text-[11px] text-zinc-400">Directly deposited post-session</span>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-yellow-400" />
          <span>Incoming Mentee Sessions ({sessions.length})</span>
        </h2>

        {sessions.length === 0 ? (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-3xl p-8 text-center text-zinc-400 text-sm">
            No incoming sessions yet. Your profile is indexed by the AI matching engine!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                        sess.status === 'PAID'
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

                  <h3 className="text-sm font-bold text-white mb-2">{sess.topic}</h3>

                  <div className="flex items-center gap-3 pt-2 mb-4">
                    <img
                      src={sess.mentee?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${sess.mentee?.name}`}
                      alt={sess.mentee?.name}
                      className="w-8 h-8 rounded-full border border-yellow-500/40 object-cover"
                    />
                    <div>
                      <div className="text-xs font-bold text-zinc-200">{sess.mentee?.name}</div>
                      <div className="text-[10px] text-zinc-400">{sess.mentee?.email}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-400">
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </span>

                  <Link
                    href={`/session/${sess.id}/chat`}
                    className="px-4 py-2 rounded-xl font-black text-xs text-black bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 transition-all flex items-center gap-1.5 shadow-md shadow-yellow-500/20"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Live Chat</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
