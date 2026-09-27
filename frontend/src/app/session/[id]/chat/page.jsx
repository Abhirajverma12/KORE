'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import ChatWindow from '@/components/ChatWindow';
import RazorpayModal from '@/components/RazorpayModal';
import { Loader2, ArrowLeft, Lock, CreditCard } from 'lucide-react';
import Link from 'next/link';

export default function SessionChatPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.id;
  const { user } = useAuth();

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPayModal, setShowPayModal] = useState(false);

  const fetchSession = async () => {
    if (!sessionId) return;
    try {
      const res = await apiRequest(`/sessions/${sessionId}`);
      setSession(res.session);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Connecting to secure chat gateway...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="text-red-400 font-bold text-base">Unable to access chat room</div>
        <p className="text-xs text-slate-400">{error || 'Session not found'}</p>
        <Link href="/" className="inline-block text-xs text-indigo-400 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  const isPaid = session.status === 'PAID' || user?.role === 'admin';

  return (
    <div className="space-y-6 py-4 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href={user?.role === 'mentor' ? '/dashboard/mentor' : '/dashboard/mentee'}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>

      {!isPaid ? (
        <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-8 text-center space-y-4 max-w-lg mx-auto shadow-2xl">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
            <Lock className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-white">Live Chat Room Locked</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Payment has not been completed for this session yet. Complete the Razorpay checkout to unlock real-time 1:1 messaging with{' '}
            <span className="text-white font-semibold">{session.mentor?.name}</span>.
          </p>

          <div className="pt-2">
            <button
              onClick={() => setShowPayModal(true)}
              className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Complete Payment (₹{Number(session.amount).toLocaleString()})</span>
            </button>
          </div>

          {showPayModal && (
            <RazorpayModal
              session={session}
              onSuccess={(unlocked) => {
                setSession(unlocked);
                setShowPayModal(false);
              }}
              onClose={() => setShowPayModal(false)}
            />
          )}
        </div>
      ) : (
        <ChatWindow session={session} />
      )}
    </div>
  );
}
