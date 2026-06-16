"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Wallet } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json().catch(() => ({}));
    setLoading(false);

    if (!res.ok) {
      setError(typeof data.error === "string" ? data.error : "Login failed");
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-8">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-white/70 bg-white/90 shadow-2xl shadow-violet-200/50 backdrop-blur">
        <div className="bg-gradient-to-r from-violet-600 via-fuchsia-500 to-cyan-500 px-6 py-8 text-white">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-white/20 p-3 backdrop-blur">
              <Wallet size={28} />
            </div>
            <div>
              <p className="flex items-center gap-1 text-sm font-medium text-white/90">
                <Sparkles size={14} />
                Family Finance
              </p>
              <h1 className="text-2xl font-bold">Income Ledger</h1>
            </div>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4 p-6">
          <label className="block">
            <span className="text-sm font-semibold text-violet-900">Username</span>
            <input
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-base outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-200"
              placeholder="masumbillahakhond"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-violet-900">Password</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1.5 w-full rounded-xl border border-violet-100 bg-violet-50/50 px-4 py-3 text-base outline-none transition focus:border-fuchsia-400 focus:bg-white focus:ring-2 focus:ring-fuchsia-200"
            />
          </label>

          {error ? (
            <p className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-3.5 text-sm font-bold text-white shadow-lg shadow-fuchsia-300/40 transition hover:brightness-110 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
