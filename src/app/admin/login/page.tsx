"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const router = useRouter();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) return;

    setLoading(true);
    setErrorMsg(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg("Invalid email or password.");
      setLoading(false);
    } else {
      router.push("/admin");
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm border border-stone-200 overflow-hidden animate-fade-in">
        <div className="bg-brand-600 px-6 py-8 text-center text-white">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <h1 className="font-extrabold text-2xl tracking-tight">Thali Raja</h1>
            <p className="text-brand-100 font-medium text-sm mt-1">Admin Portal</p>
          </Link>
        </div>

        <form onSubmit={handleLogin} className="p-6 space-y-4">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl animate-fade-in text-center">
              {errorMsg}
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors bg-stone-50 focus:bg-white text-stone-800"
              placeholder="admin@thaliraja.com"
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-stone-600 uppercase tracking-wider block">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-brand-400 focus:ring-1 focus:ring-brand-400 transition-colors bg-stone-50 focus:bg-white text-stone-800"
              placeholder="••••••••"
              required
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-brand-400 disabled:cursor-not-allowed text-white font-bold text-base py-3 px-4 rounded-xl transition-colors shadow-sm mt-2 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              "Sign In to Dashboard"
            )}
          </button>
        </form>
      </div>

      <div className="mt-8 text-center">
        <Link href="/" className="text-sm font-semibold text-stone-500 hover:text-stone-800 transition-colors">
          &larr; Back to main site
        </Link>
      </div>
    </div>
  );
}
