"use client";
import { useState } from "react";
import {
  EnvelopeIcon,
  UserIcon,
  IdentificationIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "../../context/NotificationContext";
export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { showSuccess, showError } = useNotification();

  const validateEmail = (email) => {
    
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validatePassword = (password) => {
   
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^(){}[\]-_+=])[A-Za-z\d@$!%*?&#^(){}[\]-_+=]{8,}$/.test(
      password
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!validateEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (!validatePassword(password)) {
      setError(
        "Password must be at least 8 characters, include uppercase, lowercase, number, and special character."
      );
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, username, name, password }),
      });
      const data = await res.json();
      if (res.ok) {
        showSuccess("Registered Successfully!");
        setSuccess("Signup successful! You can now login.");
        setEmail("");
        setUsername("");
        setName("");
        setPassword("");
        
      } else {
        setError(data.message || "Signup failed");
      }
    } catch (err) {
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
            Create your account
          </h2>
          <p className="text-gray-500 font-roboto  text-sm">
            Sign up to start your AI-powered learning journey
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
              htmlFor="username"
            >
              USERNAME
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 font-roboto text-gray-700"
              />
            </div>
          </div>
          <div>
            <label
              className="block text-xs font-semibold text-gray-600 mb-1"
              htmlFor="name"
            >
              NAME
            </label>
            <div className="relative">
              <IdentificationIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                id="name"
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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
            Sign Up
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
        {error && (
          <div className="text-red-600 mt-4 text-center">{error}</div>
        )}
        {success && (
          <div className="text-green-600 mt-4 text-center">{success}</div>
        )}
        <div className="text-center mt-4">
          <span className="text-gray-600">Already have an account? </span>
          <a
            href="/login"
            className="text-green-600 font-semibold underline hover:text-green-800 transition"
          >
            Login
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