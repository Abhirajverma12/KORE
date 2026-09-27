'use client';

import React, { useState } from 'react';
import { apiRequest } from '@/lib/api';
import { ShieldCheck, CheckCircle2, Lock, CreditCard, Loader2, Sparkles } from 'lucide-react';

export default function RazorpayModal({ session, onSuccess, onClose }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentStep, setPaymentStep] = useState('review');

  const handleTestMockCheckout = async () => {
    setLoading(true);
    setError(null);
    setPaymentStep('processing');

    try {
      await apiRequest('/payments/create-order', {
        method: 'POST',
        body: JSON.stringify({ sessionId: session.id }),
      });

      setPaymentStep('verifying');

      const result = await apiRequest('/payments/test-mock-checkout', {
        method: 'POST',
        body: JSON.stringify({ sessionId: session.id }),
      });

      if (result.success) {
        setPaymentStep('success');
        setTimeout(() => {
          onSuccess(result.session);
        }, 1200);
      } else {
        throw new Error(result.error || 'Payment verification failed');
      }
    } catch (err) {
      console.error('Payment failure:', err);
      setError(err.message || 'Failed to complete payment.');
      setPaymentStep('review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 relative shadow-2xl overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 mb-6">
          <div className="flex items-center gap-2 text-yellow-400">
            <Lock className="w-5 h-5" />
            <span className="font-extrabold text-sm tracking-wide uppercase font-mono">Secure Payment Checkout</span>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-lg font-bold p-1 rounded-lg hover:bg-zinc-800"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs rounded-xl p-3 mb-5">
            {error}
          </div>
        )}

        {paymentStep === 'review' && (
          <div>
            <div className="bg-black/70 border border-zinc-800 rounded-2xl p-4 mb-6">
              <span className="text-xs text-zinc-400 block mb-1">Mentorship Session</span>
              <h3 className="text-base font-bold text-white mb-2">{session.topic}</h3>
              <div className="flex items-center gap-3 pt-3 border-t border-zinc-800">
                <img
                  src={session.mentor?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${session.mentor?.name}`}
                  alt={session.mentor?.name}
                  className="w-9 h-9 rounded-full border border-yellow-500/40 object-cover"
                />
                <div>
                  <div className="text-xs font-bold text-white">{session.mentor?.name}</div>
                  <div className="text-[11px] text-yellow-400 font-semibold">{session.mentor?.headline}</div>
                </div>
              </div>
            </div>

            <div className="space-y-2 mb-6 text-sm">
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>1:1 Video & Live Chat Session (60 min)</span>
                <span>₹{Number(session.amount).toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-zinc-400 text-xs">
                <span>Platform AI Match & Room Gateway Fee</span>
                <span className="text-yellow-400 font-bold">FREE (Beta)</span>
              </div>
              <div className="pt-3 border-t border-zinc-800 flex justify-between items-baseline">
                <span className="font-bold text-white text-base">Total Amount</span>
                <span className="font-black text-2xl text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-300">
                  ₹{Number(session.amount).toLocaleString()}
                </span>
              </div>
            </div>

            <div className="bg-yellow-950/30 border border-yellow-500/30 rounded-2xl p-3.5 mb-6 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-yellow-400 shrink-0" />
              <p className="text-xs text-zinc-300">
                Encrypted via Razorpay. Real-time chat unlocks immediately after server-side cryptographic signature verification.
              </p>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleTestMockCheckout}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-black bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 hover:from-yellow-300 hover:to-amber-200 transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                Pay & Unlock Live Chat Room (Razorpay)
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'processing' && (
          <div className="py-12 flex flex-col items-center text-center">
            <Loader2 className="w-12 h-12 text-yellow-400 animate-spin mb-4" />
            <h4 className="text-lg font-bold text-white mb-1">Creating Razorpay Order...</h4>
            <p className="text-xs text-zinc-400">Initializing session tokens and order idempotency key</p>
          </div>
        )}

        {paymentStep === 'verifying' && (
          <div className="py-12 flex flex-col items-center text-center">
            <Sparkles className="w-12 h-12 text-yellow-400 animate-pulse mb-4" />
            <h4 className="text-lg font-bold text-white mb-1">Verifying Cryptographic Signature...</h4>
            <p className="text-xs text-zinc-400">Validating HMAC-SHA256 signature server-side</p>
          </div>
        )}

        {paymentStep === 'success' && (
          <div className="py-12 flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center text-yellow-400 mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-xl font-bold text-white mb-1">Payment Confirmed!</h4>
            <p className="text-xs text-zinc-400">Session unlocked. Redirecting to real-time chat room...</p>
          </div>
        )}
      </div>
    </div>
  );
}
