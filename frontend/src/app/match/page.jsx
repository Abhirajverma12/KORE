'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import IntentBreakdown from '@/components/IntentBreakdown';
import MentorCard from '@/components/MentorCard';
import RazorpayModal from '@/components/RazorpayModal';
import { Sparkles, Loader2, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

function MatchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const queryParam = searchParams.get('q') || '';
  const [rawQuery, setRawQuery] = useState(queryParam);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [matchData, setMatchData] = useState(null);

  const [selectedMentor, setSelectedMentor] = useState(null);
  const [bookingSession, setBookingSession] = useState(null);
  const [isBooking, setIsBooking] = useState(false);

  const performMatch = async (text) => {
    if (!text.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const data = await apiRequest('/queries/enhance-and-match', {
        method: 'POST',
        body: JSON.stringify({ rawText: text }),
      });
      setMatchData(data);
    } catch (err) {
      console.error('Matching failed:', err);
      setError(err.message || 'Failed to match mentors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryParam) {
      setRawQuery(queryParam);
      performMatch(queryParam);
    } else {
      setLoading(false);
    }
  }, [queryParam]);

  const handleBookMentor = async (mentor) => {
    setSelectedMentor(mentor);
    setIsBooking(true);

    try {
      const res = await apiRequest('/sessions', {
        method: 'POST',
        body: JSON.stringify({
          mentorUserId: mentor.userId,
          queryId: matchData?.queryId || undefined,
          topic: matchData?.intent?.summaryIntent || `Mentorship with ${mentor.name}`,
        }),
      });

      setBookingSession(res.session);
    } catch (err) {
      console.error('Session creation failed:', err);
      alert('Please log in as a mentee to book a session');
      router.push('/login');
    } finally {
      setIsBooking(false);
    }
  };

  const handlePaymentSuccess = (unlockedSession) => {
    setBookingSession(null);
    router.push(`/session/${unlockedSession.id}/chat`);
  };

  return (
    <div className="space-y-8 py-4">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-zinc-400 hover:text-yellow-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Query Search</span>
        </Link>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          performMatch(rawQuery);
        }}
        className="bg-zinc-900 border border-zinc-800 rounded-3xl p-2 flex items-center gap-2"
      >
        <input
          type="text"
          value={rawQuery}
          onChange={(e) => setRawQuery(e.target.value)}
          placeholder="Describe your goal (e.g. Distributed caching, staff interview prep)..."
          className="flex-1 bg-transparent px-4 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={loading || !rawQuery.trim()}
          className="px-5 py-2.5 rounded-2xl font-black text-xs text-black bg-gradient-to-r from-yellow-400 to-amber-400 hover:from-yellow-300 hover:to-amber-300 transition-all flex items-center gap-2 cursor-pointer shadow-md shadow-yellow-500/20"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          <span>Rerun Match</span>
        </button>
      </form>

      {loading && (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center animate-pulse">
              <Sparkles className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-white mb-1">Deconstructing Intent & Ranking Mentors...</h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto">
              Running OpenAI taxonomy extraction and computing multi-factor composite scores across verified mentors.
            </p>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl p-6 text-center space-y-2">
          <AlertCircle className="w-8 h-8 mx-auto text-red-400" />
          <h4 className="text-sm font-bold">Failed to process match</h4>
          <p className="text-xs">{error}</p>
        </div>
      )}

      {!loading && matchData && (
        <div className="space-y-8">
          <IntentBreakdown intent={matchData.intent} rawText={rawQuery} />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">
                Ranked Mentors ({matchData.matches.length})
              </h3>
              <span className="text-xs text-zinc-400">
                Sorted by multi-factor composite fit score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {matchData.matches.map((mentor) => (
                <MentorCard
                  key={mentor.mentorId}
                  mentor={mentor}
                  onSelect={handleBookMentor}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {bookingSession && (
        <RazorpayModal
          session={bookingSession}
          onSuccess={handlePaymentSuccess}
          onClose={() => setBookingSession(null)}
        />
      )}
    </div>
  );
}

export default function MatchPage() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-zinc-400">Loading match engine...</div>}>
      <MatchContent />
    </Suspense>
  );
}
