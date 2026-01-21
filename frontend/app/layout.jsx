"use client";
import React from "react";
import { useState } from "react";
import "../app/globals.css";
import Link from "next/link";
import {
  DocumentIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import {
  NotificationProvider,
  useNotification,
} from "../context/NotificationContext";

function SidebarLink({ icon, label, active }) {
  return (
    <Link
      href={`/${label.toLowerCase()}`}
      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition ${
        active
          ? "bg-green-100 text-green-700"
          : "text-gray-600 hover:bg-gray-100"
      }`}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}


function LogoutOverlay({ isLoggingOut }) {
  if (!isLoggingOut) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/80 backdrop-blur-sm animate-fade-in">
      <div className="flex flex-col items-center gap-4">
        
        <div className="relative">
          <div className="w-16 h-16 rounded-full border-4 border-green-200 border-t-green-500 animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <ArrowRightOnRectangleIcon className="w-6 h-6 text-green-600 animate-pulse" />
          </div>
        </div>

      
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-800 mb-1">
            Logging out...
          </h3>
          <p className="text-sm text-gray-500">See you next time!</p>
        </div>

        
        <div className="flex gap-1">
          <span
            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-green-500 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>
      </div>
    </div>
  );
}

function LayoutContent({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { showSuccess } = useNotification();

  const hideSidebar =
    pathname === "/" || pathname === "/login" || pathname === "/signup";

  const handleLogout = async () => {
    setIsLoggingOut(true);

   
    await new Promise((resolve) => setTimeout(resolve, 1500));

   
    localStorage.removeItem("user");
    localStorage.removeItem("token");

   
    showSuccess("Logged out successfully! Goodbye!");

   
    await new Promise((resolve) => setTimeout(resolve, 500));

  
    router.push("/login");

   
    setTimeout(() => setIsLoggingOut(false), 100);
  };

  

  if (hideSidebar) {
    return (
      <html lang="en">
        <body>
          <main className="h-screen">{children}</main>
        </body>
      </html>
    );
  }

  return (
    <html lang="en">
      <body>
        
        <LogoutOverlay isLoggingOut={isLoggingOut} />

        <div
          className={`flex h-screen bg-gray-50 ${
            isLoggingOut ? "pointer-events-none" : ""
          }`}
        >
         
          <aside className="w-64 h-screen fixed left-0 top-0 bg-white border-r border-gray-200 shadow-md flex flex-col justify-between py-6 px-4 z-20">
            <div>
              <div className="flex items-center gap-3 mb-10">
                <img src="/brain.png" alt="Logo" className="w-10 h-10" />
                <span className="font-extrabold text-2xl tracking-tight text-gray-900">
                  AI Learning Assistant
                </span>
              </div>
              <nav className="flex flex-col gap-2">
                <SidebarLink
                  icon={<ClipboardDocumentCheckIcon className="w-5 h-5" />}
                  label="Dashboard"
                  active={pathname === "/dashboard"}
                />
                <SidebarLink
                  icon={<DocumentIcon className="w-5 h-5" />}
                  label="Documents"
                  active={pathname === "/documents"}
                />
                <SidebarLink
                  icon={<ArrowTrendingUpIcon className="w-5 h-5" />}
                  label="Analytics"
                  active={pathname === "/analytics"}
                />
                <SidebarLink
                  icon={<UserIcon className="w-5 h-5" />}
                  label="Profile"
                  active={pathname === "/profile"}
                />
              </nav>
            </div>
            <button
              className={`flex items-center cursor-pointer gap-2 text-gray-500 hover:text-red-500 font-semibold py-2 px-3 rounded transition ${
                isLoggingOut ? "opacity-50 cursor-not-allowed" : ""
              }`}
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <ArrowRightOnRectangleIcon
                className={`w-5 h-5 ${isLoggingOut ? "animate-pulse" : ""}`}
              />
              {isLoggingOut ? "Logging out..." : "Logout"}
            </button>
          </aside>
         
          <main className="flex-1 ml-64 h-screen overflow-y-auto p-8">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

export default function RootLayout({ children }) {
  return (
    <NotificationProvider>
      <LayoutContent>{children}</LayoutContent>
    </NotificationProvider>
  );
}
