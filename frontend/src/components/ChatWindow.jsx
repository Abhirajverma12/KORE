'use client';

import React, { useState, useEffect, useRef } from 'react';
import { getSocket } from '@/lib/socket';
import { apiRequest } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';
import { Send, Zap, ShieldCheck, CheckCheck } from 'lucide-react';

export default function ChatWindow({ session }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [peerTyping, setPeerTyping] = useState(null);
  const [lastLatencyMs, setLastLatencyMs] = useState(32);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const isMentor = user?.id === session?.mentor?.id;
  const peerName = isMentor ? session?.mentee?.name : session?.mentor?.name;

  useEffect(() => {
    if (!session?.id) return;
    apiRequest(`/sessions/${session.id}/messages`)
      .then((res) => {
        setMessages(res.messages || []);
      })
      .catch((err) => console.error('Error loading chat messages:', err));
  }, [session?.id]);

  useEffect(() => {
    if (!session?.id) return;
    const socket = getSocket();

    const onConnect = () => {
      setIsConnected(true);
      socket.emit('join_session', { sessionId: session.id }, (res) => {
        if (!res?.success) {
          console.warn('Socket join room rejected:', res?.error);
        }
      });
    };

    const onDisconnect = () => {
      setIsConnected(false);
    };

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (typeof msg.latencyMs === 'number') {
        setLastLatencyMs(msg.latencyMs);
      }
    };

    const onUserTyping = (data) => {
      if (data.userId !== user?.id) {
        setPeerTyping(data.isTyping ? data.name : null);
      }
    };

    if (socket.connected) {
      onConnect();
    } else {
      socket.connect();
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('new_message', onNewMessage);
    socket.on('user_typing', onUserTyping);

    return () => {
      socket.emit('leave_session', { sessionId: session.id });
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('new_message', onNewMessage);
      socket.off('user_typing', onUserTyping);
    };
  }, [session?.id, user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, peerTyping]);

  const handleInputChange = (e) => {
    setInputText(e.target.value);
    const socket = getSocket();

    if (socket && socket.connected) {
      socket.emit('typing', { sessionId: session.id, isTyping: true });

      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit('typing', { sessionId: session.id, isTyping: false });
      }, 1500);
    }
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const textToSend = inputText.trim();
    setInputText('');

    const socket = getSocket();
    const clientSentAt = Date.now();

    if (socket && socket.connected) {
      socket.emit(
        'send_message',
        { sessionId: session.id, text: textToSend, clientSentAt },
        (res) => {
          if (res?.success) {
            setLastLatencyMs(res.totalRoundtripEst || res.latencyMs || 25);
          }
        }
      );
    }
  };

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-3xl flex flex-col h-[680px] shadow-2xl overflow-hidden">
      <div className="bg-black/90 px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                (isMentor ? session?.mentee?.avatarUrl : session?.mentor?.avatarUrl) ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${peerName}`
              }
              alt={peerName}
              className="w-10 h-10 rounded-2xl object-cover border border-yellow-500/50"
            />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black ${
                isConnected ? 'bg-yellow-400' : 'bg-zinc-600'
              }`}
            />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {peerName}
              <span className="text-[10px] font-bold text-black bg-yellow-400 px-2 py-0.5 rounded-full">
                {isMentor ? 'Mentee' : 'Verified Mentor'}
              </span>
            </h3>
            <p className="text-xs text-zinc-400 truncate max-w-md">{session?.topic}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-black border border-yellow-400/40 text-yellow-400 text-xs font-mono font-bold shadow-inner">
            <Zap className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400 animate-pulse" />
            <span>{lastLatencyMs || 28}ms</span>
            <span className="text-[10px] text-zinc-400 font-sans font-normal">sub-200ms</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-black/60 to-zinc-900/60">
        <div className="bg-yellow-950/20 border border-yellow-500/20 rounded-2xl p-3 text-center flex items-center justify-center gap-2 text-xs text-yellow-300">
          <ShieldCheck className="w-4 h-4 text-yellow-400" />
          <span>Session unlocked with verified server payment. Socket encrypted 1:1 stream active.</span>
        </div>

        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          const senderName = msg.sender?.name || (isMe ? user?.name : peerName);

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isMe ? 'justify-end' : 'justify-start'}`}
            >
              {!isMe && (
                <img
                  src={msg.sender?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${senderName}`}
                  alt={senderName}
                  className="w-7 h-7 rounded-xl object-cover border border-zinc-700 mb-1"
                />
              )}

              <div
                className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-md ${
                  isMe
                    ? 'bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 text-black font-medium rounded-br-xs'
                    : 'bg-zinc-800 border border-zinc-700 text-zinc-100 rounded-bl-xs'
                }`}
              >
                {!isMe && (
                  <div className="text-[11px] font-bold text-yellow-400 mb-1">
                    {senderName}
                  </div>
                )}
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                <div
                  className={`flex items-center justify-end gap-1.5 mt-1 text-[10px] ${
                    isMe ? 'text-black/70 font-semibold' : 'text-zinc-400'
                  }`}
                >
                  <span>
                    {new Date(msg.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                  {isMe && <CheckCheck className="w-3 h-3 text-black" />}
                </div>
              </div>
            </div>
          );
        })}

        {peerTyping && (
          <div className="flex items-center gap-2 text-xs text-yellow-400 italic">
            <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping" />
            <span>{peerTyping} is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 bg-black border-t border-zinc-800 flex items-center gap-3">
        <input
          type="text"
          value={inputText}
          onChange={handleInputChange}
          placeholder={`Message ${peerName}...`}
          className="flex-1 bg-zinc-900 border border-zinc-800 focus:border-yellow-400 rounded-2xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none transition-colors"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="p-3 bg-yellow-400 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-yellow-400 text-black font-bold rounded-2xl transition-all shadow-md shadow-yellow-500/20 cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
