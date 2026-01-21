"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useNotification } from "../../context/NotificationContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();
  const { showSuccess, showError } = useNotification();


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setSuccess("Login successful!");
        showSuccess("Login successful! Welcome back!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1000);
      } else {
        showError(data.message || "Login failed");
        setError(data.message || "Login failed");
      }
    } catch (err) {
      showError("Network error. Please try again.");
      setError("Network error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-gray-100">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-green-100 rounded-full p-4 mb-2">
           
            <img
              src="/brain.png"
              alt="Brain Circuit Logo"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1 font-montserrat">
            Welcome back
          </h2>
          <p className="text-gray-500 font-roboto mb-2 text-sm">
            Sign in to continue your journey
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              className="block text-xs font-semibold text-gray-600 mb-1"
              htmlFor="email"
            >
              EMAIL
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="email"
                type="email"
                autoComplete="off"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-roboto text-gray-700"
              />
            </div>
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-gray-600 mb-1"
              htmlFor="password"
            >
              PASSWORD
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                autoComplete="off"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-roboto text-gray-700"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold cursor-pointer rounded-lg flex items-center justify-center gap-2 hover:scale-105 hover:shadow-xl transition-all duration-200"
          >
            Sign in
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 12h14m-7-7l7 7-7 7"
              />
            </svg>
          </button>
        </form>
        {error && <div className="text-red-600 mt-4 text-center">{error}</div>}
        {success && (
          <div className="text-green-600 mt-4 text-center">{success}</div>
        )}
        <div className="text-center mt-8">
          <span className="text-gray-600">Don't have an account? </span>
          <a
            href="/signup"
            className="text-green-600 font-semibold underline hover:text-green-800 transition"
          >
            Sign up
          </a>
        </div>
      </div>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@700&family=Roboto:wght@400;500&display=swap');
        .font-montserrat { font-family: 'Montserrat', Arial, sans-serif; }
        .font-roboto { font-family: 'Roboto', Arial, sans-serif; }
      `}</style>
    </div>
  );
}
