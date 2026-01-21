"use client";
import { useState, useEffect } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";
import { useNotification } from "../../context/NotificationContext";
export default function ProfilePage() {
  const [user, setUser] = useState({ name: "", email: "" });
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError } = useNotification();
  useEffect(() => {
    const loadProfile = async () => {
      setIsLoading(true);
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser({
          name: parsed.name || "",
          email: parsed.email || "",
        });
      }
      setIsLoading(false);
    };
    loadProfile();
  }, []);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setMsg("");
    setErr("");
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      setErr("All fields are required.");
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErr("New passwords do not match.");
      return;
    }
    try {
      const storedUser = localStorage.getItem("user");
      let userId = undefined;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.userId || parsed.id || parsed._id;
      }
      const res = await fetch(
        "http://localhost:5000/api/auth/update-password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            userId,
            currentPassword,
            newPassword,
          }),
        }
      );
      const data = await res.json();
      if (res.ok) {
        setMsg("Password updated successfully!");
        showSuccess("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmNewPassword("");
      } else {
        setErr(data.message || "Failed to update password.");
        showError("Failed to update password.");
      }
    } catch {
      setErr("Network error.");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="text-gray-500 font-medium">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-bold mb-8 font-montserrat text-gray-900">
          Profile Settings
        </h2>
        <div className="bg-white rounded-xl shadow-lg mb-8 p-6">
          <h3 className="text-lg font-semibold mb-4 font-montserrat text-gray-800">
            User Information
          </h3>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Name
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={user.name}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-roboto text-gray-700"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              Email Address
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg bg-gray-100 font-roboto text-gray-700"
              />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4 font-montserrat text-gray-800">
            Change Password
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Current Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-roboto text-gray-700"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-roboto text-gray-700"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg font-roboto text-gray-700"
                  required
                />
              </div>
            </div>
            <button
              type="submit"
              className="bg-green-500 cursor-pointer hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition-all"
            >
              Change Password
            </button>
          </form>
          {err && <div className="text-red-600 mt-4 text-center">{err}</div>}
          {msg && <div className="text-green-600 mt-4 text-center">{msg}</div>}
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
