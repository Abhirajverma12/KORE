'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import RazorpayModal from '@/components/RazorpayModal';
import { Loader2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params?.sessionId;

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!sessionId) return;
    apiRequest(`/sessions/${sessionId}`)
      .then((res) => {
        setSession(res.session);
        if (res.session.status === 'PAID') {
          router.push(`/session/${sessionId}/chat`);
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [sessionId, router]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-center">
        <Loader2 className="w-10 h-10 text-indigo-400 animate-spin mb-4" />
        <p className="text-sm text-slate-400">Loading session checkout...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="py-20 text-center space-y-4">
        <div className="text-red-400 font-bold text-base">Checkout Error</div>
        <p className="text-xs text-slate-400">{error || 'Session not found'}</p>
        <Link href="/" className="inline-block text-xs text-indigo-400 underline">
          Back to Home
        </Link>
      </div>
    );
  }

  return (
    <div className="py-10 max-w-xl mx-auto">
      <Link
        href="/dashboard/mentee"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </Link>

      <RazorpayModal
        session={session}
        onSuccess={(unlocked) => router.push(`/session/${unlocked.id}/chat`)}
        onClose={() => router.push('/dashboard/mentee')}
      />
    </div>
  );
}
