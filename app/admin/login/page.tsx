"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    setIsLoading(true);

    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      setError("비밀번호가 올바르지 않습니다.");
      setIsLoading(false);
      return;
    }

    router.push("/admin");
  };

  return (
    <main className="min-h-screen bg-pink-50 p-8 flex items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border bg-white p-6 shadow-sm">
        <h1 className="mb-4 text-2xl font-bold text-black">🔒 관리자 로그인</h1>

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="관리자 비밀번호"
          className="mb-3 w-full rounded-xl border px-4 py-3 text-black"
        />

        {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white hover:bg-gray-800 disabled:bg-gray-300"
        >
          {isLoading ? "확인 중..." : "로그인"}
        </button>
        <a
          href="/"
          className="mt-3 block w-full rounded-xl border px-4 py-3 text-center font-semibold text-black hover:bg-gray-50"
        >
          ← Back to Home
        </a>
      </div>
    </main>
  );
}
