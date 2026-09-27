import '../styles/globals.css';
import { AuthProvider } from '../context/AuthContext';
import Navbar from '../components/Navbar';

export const metadata = {
  title: 'KORE — AI-Powered Mentorship Platform',
  description: 'Match with world-class tech mentors using LLM query understanding, instant ranking, sub-200ms chat, and integrated payments.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-[#08080a] text-zinc-100 antialiased font-sans">
        <AuthProvider>
          <Navbar />
          <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </main>
          <footer className="border-t border-zinc-800/80 py-8 text-center text-xs text-zinc-500 bg-[#050507]">
            <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <span className="font-bold text-yellow-400 font-mono">KORE AI</span>
                <span>• Intelligent Mentorship Discovery</span>
              </div>
              <div className="flex items-center gap-4 text-zinc-400">
                <span>Next.js 14 App Router</span>
                <span>•</span>
                <span>Express & Socket.IO</span>
                <span>•</span>
                <span>Prisma ORM</span>
                <span>•</span>
                <span>Razorpay HMAC</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
