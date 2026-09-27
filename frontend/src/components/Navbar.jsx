'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Sparkles, Shield, LogOut, ArrowRight, Layers } from 'lucide-react';

export default function Navbar() {
  const { user, logout, switchDemoUser } = useAuth();
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#08080a]/85 border-b border-zinc-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-yellow-500 via-amber-400 to-yellow-300 flex items-center justify-center shadow-lg shadow-yellow-500/20 group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-black" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-xl tracking-wider text-white font-mono flex items-center gap-1.5">
              KORE <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 font-sans font-bold border border-yellow-400/30">AI 2.0</span>
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              pathname === '/' ? 'text-yellow-400 font-bold' : 'text-zinc-300 hover:text-yellow-300'
            }`}
          >
            AI Matching
          </Link>
          {user && (
            <>
              {user.role === 'mentee' && (
                <Link
                  href="/dashboard/mentee"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith('/dashboard/mentee') ? 'text-yellow-400 font-bold' : 'text-zinc-300 hover:text-yellow-300'
                  }`}
                >
                  My Mentorships
                </Link>
              )}
              {user.role === 'mentor' && (
                <Link
                  href="/dashboard/mentor"
                  className={`text-sm font-medium transition-colors ${
                    pathname.startsWith('/dashboard/mentor') ? 'text-yellow-400 font-bold' : 'text-zinc-300 hover:text-yellow-300'
                  }`}
                >
                  Mentor Hub
                </Link>
              )}
              {user.role === 'admin' && (
                <Link
                  href="/dashboard/admin"
                  className={`text-sm font-medium transition-colors flex items-center gap-1.5 ${
                    pathname.startsWith('/dashboard/admin') ? 'text-yellow-400 font-bold' : 'text-zinc-300 hover:text-yellow-300'
                  }`}
                >
                  <Shield className="w-4 h-4 text-yellow-400" />
                  Admin Console
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User / Demo Switcher Section */}
        <div className="flex items-center gap-3">
          {/* Quick Demo Role Switcher */}
          <div className="hidden lg:flex items-center bg-zinc-900 border border-zinc-800 rounded-xl p-1 text-xs">
            <span className="text-zinc-400 px-2 flex items-center gap-1">
              <Layers className="w-3 h-3 text-yellow-400" />
              Demo as:
            </span>
            <button
              onClick={() => switchDemoUser('mentee')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                user?.role === 'mentee'
                  ? 'bg-yellow-400 text-black font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Mentee
            </button>
            <button
              onClick={() => switchDemoUser('mentor')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                user?.role === 'mentor'
                  ? 'bg-yellow-400 text-black font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Mentor
            </button>
            <button
              onClick={() => switchDemoUser('admin')}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                user?.role === 'admin'
                  ? 'bg-amber-500 text-black font-extrabold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              Admin
            </button>
          </div>

          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-800 px-3 py-1.5 rounded-xl">
                <img
                  src={user.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-yellow-500/40"
                />
                <div className="flex flex-col text-left">
                  <span className="text-xs font-bold text-white leading-tight">{user.name}</span>
                  <span className="text-[10px] text-yellow-400 font-semibold capitalize">{user.role}</span>
                </div>
              </div>
              <button
                onClick={logout}
                title="Logout"
                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-zinc-900 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs font-medium text-zinc-300 hover:text-white px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                Log In
              </Link>
              <Link
                href="/register"
                className="text-xs font-bold text-black bg-yellow-400 hover:bg-yellow-300 px-4 py-2 rounded-xl shadow-md shadow-yellow-500/20 transition-all flex items-center gap-1.5"
              >
                Get Started
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
