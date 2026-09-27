'use client';

import React, { useState, useEffect } from 'react';
import { apiRequest } from '@/lib/api';
import { Shield, Brain, MessageSquare, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const [metrics, setMetrics] = useState(null);
  const [queries, setQueries] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiRequest('/admin/metrics'),
      apiRequest('/admin/queries'),
      apiRequest('/admin/sessions'),
    ])
      .then(([metricsRes, queriesRes, sessionsRes]) => {
        setMetrics(metricsRes.metrics);
        setQueries(queriesRes.queries || []);
        setSessions(sessionsRes.sessions || []);
      })
      .catch((err) => console.error('Admin fetch error:', err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-yellow-400 animate-spin mb-4" />
        <p className="text-sm text-zinc-400">Loading platform metrics & telemetry...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-yellow-400" />
            <span>KORE Platform Admin Console</span>
          </h1>
          <p className="text-xs text-zinc-400">Platform-wide telemetry, OpenAI query logs, and conversion health</p>
        </div>
      </div>

      {metrics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <span className="text-xs text-zinc-400 block mb-1">Total Gross Revenue (GMV)</span>
            <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-amber-500">
              ₹{Number(metrics.totalGMV).toLocaleString()}
            </div>
            <span className="text-[11px] text-yellow-400 font-semibold">{metrics.paidSessions} paid transactions</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <span className="text-xs text-zinc-400 block mb-1">AI Matching Queries</span>
            <div className="text-2xl font-black text-white">{metrics.totalQueries}</div>
            <span className="text-[11px] text-zinc-400">Avg Fit: {metrics.avgMatchScore}%</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <span className="text-xs text-zinc-400 block mb-1">Match $\to$ Book Conversion</span>
            <div className="text-2xl font-black text-yellow-400">{metrics.conversionRate}%</div>
            <span className="text-[11px] text-zinc-400">Industry benchmark: 12%</span>
          </div>

          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-5">
            <span className="text-xs text-zinc-400 block mb-1">Active Mentors</span>
            <div className="text-2xl font-black text-white">{metrics.totalMentors}</div>
            <span className="text-[11px] text-zinc-400">{metrics.totalMentees} registered mentees</span>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-yellow-400" />
          <span>LLM Query Enhancement Audit Log ({queries.length})</span>
        </h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-black text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Mentee</th>
                <th className="px-4 py-3">Raw Query</th>
                <th className="px-4 py-3">Extracted Skills</th>
                <th className="px-4 py-3">Seniority</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {queries.map((q) => (
                <tr key={q.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-semibold text-white">{q.mentee?.name || 'Guest'}</td>
                  <td className="px-4 py-3 max-w-xs truncate" title={q.rawText}>{q.rawText}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {q.enhancedIntent?.primarySkills?.map((s, idx) => (
                        <span key={idx} className="bg-yellow-400/10 text-yellow-300 px-1.5 py-0.5 rounded text-[10px] border border-yellow-400/30">
                          {s}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-bold text-yellow-400">{q.enhancedIntent?.seniorityLevel}</td>
                  <td className="px-4 py-3 text-amber-300">{q.enhancedIntent?.problemType}</td>
                  <td className="px-4 py-3 text-zinc-500">{new Date(q.createdAt).toLocaleTimeString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="space-y-4 pt-6 border-t border-zinc-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-yellow-400" />
          <span>Platform Sessions & Razorpay Status ({sessions.length})</span>
        </h2>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-black text-zinc-400 uppercase tracking-wider text-[10px] border-b border-zinc-800">
              <tr>
                <th className="px-4 py-3">Mentor</th>
                <th className="px-4 py-3">Mentee</th>
                <th className="px-4 py-3">Topic</th>
                <th className="px-4 py-3">Amount</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Razorpay Order ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {sessions.map((s) => (
                <tr key={s.id} className="hover:bg-zinc-800/40">
                  <td className="px-4 py-3 font-semibold text-white">{s.mentor?.name}</td>
                  <td className="px-4 py-3 text-zinc-300">{s.mentee?.name}</td>
                  <td className="px-4 py-3 max-w-xs truncate">{s.topic}</td>
                  <td className="px-4 py-3 font-bold text-white">₹{s.amount}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${
                        s.status === 'PAID'
                          ? 'bg-yellow-400/10 text-yellow-400 border-yellow-400/30'
                          : 'bg-zinc-800 text-zinc-400 border-zinc-700'
                      }`}
                    >
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-[10px] text-zinc-400">{s.razorpayOrderId || 'Pending'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
