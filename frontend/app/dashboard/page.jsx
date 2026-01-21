"use client";
import { useEffect, useState } from "react";
import axios from "../../utils/api";
import {
  DocumentIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  BellIcon,
  ArrowRightOnRectangleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";

export default function DashboardPage() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [stats, setStats] = useState({
    documents: 0,
    flashcards: 0,
    quizzes: 0,
  });
  const [activity, setActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStats = async (userId) => {
    console.log("Fetching stats for userId:", userId);
    if (!userId) {
      console.log("No userId provided");
      return;
    }
    try {
      const res = await axios.get(`/documents/stats/${userId}`);
      console.log("Stats response:", res.data);
      setStats(res.data);
    } catch (err) {
      console.error("Stats fetch error:", err);
      setStats({ documents: 0, flashcards: 0, quizzes: 0 });
    }
  };

  const fetchActivity = async (userId) => {
    if (!userId) return;
    try {
      const res = await axios.get(`/documents/activity/${userId}`);
      setActivity(res.data.activities || []);
    } catch {
      setActivity([]);
    }
  };

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      const userData = localStorage.getItem("user");
      if (userData) {
        try {
          const parsed = JSON.parse(userData);
          const userId = parsed.id || parsed.userId || parsed._id;
          setUser({
            name: parsed.name,
            email: parsed.email,
            id: userId,
          });
          await fetchStats(userId);
          await fetchActivity(userId);
        } catch {
          setUser({ name: "", email: "", id: null });
        }
      }
      setIsLoading(false);
    };
    loadDashboard();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-100">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="text-gray-500 font-medium">
            Loading dashboard...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-100 flex">
      
      <main className="flex-1 max-w-7xl mx-auto">
        
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Dashboard</h1>
            <p className="text-gray-500 text-sm">
              Track your learning progress and activity
            </p>
          </div>
          
          <div className="flex items-center gap-2 bg-white/80 backdrop-blur rounded-xl shadow px-3 py-1.5 border border-gray-100 hover:shadow-lg transition-all duration-300">
            <div className="w-7 h-7 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-white font-semibold text-xs">
                {user.name ? user.name.charAt(0).toUpperCase() : "U"}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 text-sm leading-tight">
                {user.name || "User"}
              </span>
              <span className="text-gray-500 text-xs leading-tight">
                {user.email || "No email"}
              </span>
            </div>
          </div>
        </div>

       
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            label="Total Documents"
            value={stats.documents}
            icon={<DocumentIcon className="w-7 h-7 text-blue-500" />}
            bg="from-blue-100 to-blue-50"
          />
          <StatCard
            label="Total Flashcards"
            value={stats.flashcards}
            icon={<BookOpenIcon className="w-7 h-7 text-pink-500" />}
            bg="from-pink-100 to-pink-50"
          />
          <StatCard
            label="Total Quizzes"
            value={stats.quizzes}
            icon={
              <ClipboardDocumentCheckIcon className="w-7 h-7 text-green-500" />
            }
            bg="from-green-100 to-green-50"
          />
        </div>

       
        <section className="bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6">
          <h2 className="flex items-center gap-2 text-xl font-semibold mb-4">
            <svg
              className="w-6 h-6 text-gray-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Recent Activity
          </h2>
          <ul className="divide-y divide-gray-100">
            {activity.length === 0 ? (
              <li className="py-4 text-gray-400">No recent activity.</li>
            ) : (
              activity.map((item, idx) => (
                <li
                  key={idx}
                  className="flex items-center justify-between py-4 hover:bg-blue-50 transition rounded-lg px-2 group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-blue-500 rounded-full group-hover:scale-125 transition"></span>
                    <div>
                      <div className="font-semibold text-gray-800 text-sm flex items-center gap-2">
                       
                        {item.type === "document_access" && (
                          <DocumentIcon className="w-4 h-4 text-blue-400" />
                        )}
                        {item.type === "quiz_attempt" && (
                          <ClipboardDocumentCheckIcon className="w-4 h-4 text-green-400" />
                        )}
                        {item.title}
                      </div>
                      <div className="text-xs text-gray-400">{item.date}</div>
                    </div>
                  </div>
                </li>
              ))
            )}
          </ul>
        </section>
      </main>
    </div>
  );
}

import Link from "next/link";

function SidebarLink({ icon, label, active }) {
  return (
    <Link
      href={`/${label.toLowerCase()}`}
      className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition ${
        active
          ? "bg-green-100 text-green-700"
          : "text-gray-600 hover:bg-green-50 hover:text-green-700"
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}

function StatCard({ label, value, icon, bg }) {
  return (
    <div
      className={`relative flex items-center cursor-pointer gap-4 bg-gradient-to-br ${bg} rounded-2xl shadow p-6 group overflow-hidden transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
    >
      <div className="bg-white rounded-xl p-3 shadow group-hover:scale-105 transition-transform">
        {icon}
      </div>
      <div>
        <div className="text-xs text-gray-500 font-semibold uppercase mb-1">
          {label}
        </div>
        <div className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition">
          {value}
        </div>
      </div>
    </div>
  );
}
