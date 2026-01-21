"use client";
import React, { useEffect, useState } from "react";
import axios from "../../utils/api";
import { Bar, Line } from "react-chartjs-2";
import { FireIcon, ClockIcon, BookOpenIcon } from "@heroicons/react/24/solid";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function AnalyticsPage() {
  const [streak, setStreak] = useState(0);
  const [consistency, setConsistency] = useState([]);
  const [weekDays, setWeekDays] = useState([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
    "Sun",
  ]);
  const [timeSpent, setTimeSpent] = useState([]);
  const [progress, setProgress] = useState({ week: [], month: [] });
  const [selectedView, setSelectedView] = useState("week");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchAnalytics() {
      setIsLoading(true);
      try {
        const storedUser = localStorage.getItem("user");
        if (!storedUser) return;
        const parsed = JSON.parse(storedUser);
        const userId = parsed.id || parsed.userId || parsed._id;

        const res = await axios.get(`/documents/analytics/${userId}`);
        const { activities, timeSpent: timeData, weekSessions } = res.data;

        const today = new Date();
        let consistencyArr = [];
        let dynamicWeekDays = [];
        const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        for (let i = 6; i >= 0; i--) {
          const day = new Date(today);
          day.setDate(today.getDate() - i);
          // Use local date format to avoid timezone issues with toISOString()
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, "0");
          const date = String(day.getDate()).padStart(2, "0");
          const dayStr = `${year}-${month}-${date}`;
          const didStudy = activities.some(
            (a) => a.created_at && a.created_at.startsWith(dayStr)
          );
          consistencyArr.push(didStudy ? 1 : 0);
          dynamicWeekDays.push(dayNames[day.getDay()]);
        }

        let streakCount = 0;
        for (let i = 6; i >= 0; i--) {
          if (consistencyArr[6 - i]) streakCount++;
          else break;
        }

        setStreak(streakCount);
        setConsistency(consistencyArr);
        setWeekDays(dynamicWeekDays);
        setTimeSpent(
          timeData.map((t) => ({ doc: t.title, minutes: Number(t.minutes) }))
        );

        // Build weekProgress to match the last 7 days (same as consistency)
        const weekProgress = [];
        for (let i = 6; i >= 0; i--) {
          const day = new Date(today);
          day.setDate(today.getDate() - i);
          const year = day.getFullYear();
          const month = String(day.getMonth() + 1).padStart(2, "0");
          const date = String(day.getDate()).padStart(2, "0");
          const dayStr = `${year}-${month}-${date}`;
          const session = weekSessions.find(
            (s) => s.day && s.day.startsWith(dayStr)
          );
          weekProgress.push(session ? Number(session.count) : 0);
        }
        setProgress({ week: weekProgress, month: [18, 22, 25, 28] });
      } catch (err) {
        console.error("Failed to fetch analytics", err);
      }
      setIsLoading(false);
    }
    fetchAnalytics();
  }, []);

  const totalMinutes = timeSpent.reduce((sum, item) => sum + item.minutes, 0);
  const totalSessions = progress.week.reduce((sum, val) => sum + val, 0);

  return (
    <div className="min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text mb-3">
            Learning Analytics
          </h1>
          <p className="text-gray-600 font-medium">
            Track your progress and build better study habits
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-2xl cursor-pointer shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Current Streak
                  </h3>
                  <FireIcon className="w-8 h-8 text-orange-500" />
                </div>
                <div className="text-4xl font-bold text-emerald-600 mb-2">
                  {streak}
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  days in a row
                </p>
              </div>

              <div className="bg-white rounded-2xl cursor-pointer shadow-lg p-6 transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Total Time
                  </h3>
                  <ClockIcon className="w-8 h-8 text-teal-500" />
                </div>
                <div className="text-4xl font-bold text-teal-600 mb-2">
                  {totalMinutes}
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  minutes this week
                </p>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                    Study Sessions
                  </h3>
                  <BookOpenIcon className="w-8 h-8 text-cyan-500" />
                </div>
                <div className="text-4xl font-bold text-cyan-600 mb-2">
                  {totalSessions}
                </div>
                <p className="text-gray-500 text-sm font-medium">
                  sessions this week
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 transform transition-all duration-300 hover:shadow-xl">
              <h2 className="text-xl font-bold text-gray-800 mb-6">
                Weekly Consistency
              </h2>
              <div className="flex justify-center gap-3">
                {consistency.map((val, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col items-center gap-2 group"
                  >
                    <div
                      className={`w-14 h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg transition-all duration-300 transform group-hover:scale-110 ${
                        val
                          ? "bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md"
                          : "bg-gray-200 text-gray-400"
                      }`}
                    >
                      {val ? "✓" : "○"}
                    </div>
                    <span className="text-xs font-medium text-gray-600">
                      {weekDays[idx]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
                <h2 className="text-xl font-bold text-gray-800 mb-6">
                  Study Time by Subject
                </h2>
                <div className="h-64">
                  <Bar
                    data={{
                      labels: timeSpent.map((t) => t.doc),
                      datasets: [
                        {
                          label: "Minutes",
                          data: timeSpent.map((t) => t.minutes),
                          backgroundColor: [
                            "rgba(16, 185, 129, 0.8)",
                            "rgba(20, 184, 166, 0.8)",
                            "rgba(6, 182, 212, 0.8)",
                            "rgba(34, 211, 238, 0.8)",
                            "rgba(56, 189, 248, 0.8)",
                          ],
                          borderRadius: 8,
                          borderWidth: 0,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          titleFont: { size: 14, weight: "bold" },
                          bodyFont: { size: 13 },
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: "rgba(0, 0, 0, 0.05)" },
                          ticks: { font: { size: 11, weight: "500" } },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 11, weight: "500" } },
                        },
                      },
                    }}
                  />
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-lg p-8 transform transition-all duration-300 hover:shadow-xl">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-800">
                    Session Trends
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedView("week")}
                      className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedView === "week"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setSelectedView("month")}
                      className={`px-4 py-2 cursor-pointer rounded-lg text-sm font-medium transition-all duration-300 ${
                        selectedView === "month"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      Month
                    </button>
                  </div>
                </div>
                <div className="h-64">
                  <Line
                    data={{
                      labels:
                        selectedView === "week"
                          ? weekDays
                          : ["Week 1", "Week 2", "Week 3", "Week 4"],
                      datasets: [
                        {
                          label: "Sessions",
                          data:
                            selectedView === "week"
                              ? progress.week
                              : progress.month,
                          borderColor: "rgba(16, 185, 129, 1)",
                          backgroundColor: "rgba(16, 185, 129, 0.1)",
                          tension: 0.4,
                          fill: true,
                          pointRadius: 6,
                          pointHoverRadius: 8,
                          pointBackgroundColor: "rgba(16, 185, 129, 1)",
                          pointBorderColor: "#fff",
                          pointBorderWidth: 2,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        legend: { display: false },
                        tooltip: {
                          backgroundColor: "rgba(0, 0, 0, 0.8)",
                          padding: 12,
                          titleFont: { size: 14, weight: "bold" },
                          bodyFont: { size: 13 },
                          borderColor: "rgba(255, 255, 255, 0.1)",
                          borderWidth: 1,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          grid: { color: "rgba(0, 0, 0, 0.05)" },
                          ticks: { font: { size: 11, weight: "500" } },
                        },
                        x: {
                          grid: { display: false },
                          ticks: { font: { size: 11, weight: "500" } },
                        },
                      },
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl shadow-lg p-8 text-white text-center">
              <h3 className="text-2xl font-bold mb-2">
                Keep Up The Great Work! 🎉
              </h3>
              <p className="text-emerald-50 font-medium">
                You're making excellent progress. Consistency is the key to
                success!
              </p>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}
