"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Brain,
  Sparkles,
  Zap,
  Target,
  TrendingUp,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

export default function LandingPage() {
  const [scrollY, setScrollY] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    {
      icon: Brain,
      title: "AI-Powered Learning",
      description:
        "Get personalized study recommendations tailored to your learning style and pace.",
      color: "from-emerald-500 to-green-500",
    },
    {
      icon: Sparkles,
      title: "Smart Summaries",
      description:
        "Transform complex topics into easy-to-understand summaries instantly.",
      color: "from-teal-500 to-cyan-500",
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description:
        "Set learning goals and watch your progress with intelligent insights.",
      color: "from-green-500 to-lime-500",
    },
    {
      icon: Zap,
      title: "Quick Answers",
      description:
        "Get instant explanations for any question, anytime you need help.",
      color: "from-emerald-600 to-teal-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 text-slate-900 overflow-x-hidden">
     
      <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-lg border-b border-green-200/50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <BookOpen className="w-8 h-8 text-emerald-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                StudyAI
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#features"
                className="text-slate-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-slate-700 hover:text-emerald-600 transition-colors font-medium"
              >
                How It Works
              </a>
              <button
                className="px-6 py-2 bg-gradient-to-r cursor-pointer from-emerald-600 to-green-600 text-white rounded-full hover:shadow-lg hover:shadow-emerald-500/30 transition-all transform hover:scale-105 font-medium"
                onClick={() => router.push("/login")}
              >
                Get Started
              </button>
            </div>

            <button
              className="md:hidden text-slate-700"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-green-200/50">
            <div className="px-4 py-4 space-y-4">
              <a
                href="#features"
                className="block text-slate-700 hover:text-emerald-600 transition-colors font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="block text-slate-700 hover:text-emerald-600 transition-colors font-medium"
              >
                How It Works
              </a>
              <button
                className="w-full cursor-pointer px-6 py-2 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full font-medium"
                onClick={() => router.push("/login")}
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </nav>

      
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div
              className="inline-block mb-6 transform transition-all duration-1000"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.5, 50)}px)`,
                opacity: Math.max(1 - scrollY * 0.002, 0),
              }}
            >
              <div className="flex items-center justify-center space-x-2 bg-emerald-100 backdrop-blur-sm border border-emerald-300 rounded-full px-6 py-2">
                <Sparkles className="w-5 h-5 text-emerald-600 animate-pulse" />
                <span className="text-sm font-medium text-emerald-800">
                  Powered by Advanced AI
                </span>
              </div>
            </div>

            <h1
              className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.3, 30)}px)`,
                opacity: Math.max(1 - scrollY * 0.002, 0),
              }}
            >
              <span className="bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 bg-clip-text text-transparent animate-gradient bg-[length:200%_auto]">
                Study Smarter,
              </span>
              <br />
              <span className="text-slate-900">Not Harder</span>
            </h1>

            <p
              className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.2, 20)}px)`,
                opacity: Math.max(1 - scrollY * 0.002, 0),
              }}
            >
              Your AI-powered study companion that adapts to your learning
              style, helps you master any subject, and tracks your progress in
              real-time.
            </p>

            <div
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
              style={{
                transform: `translateY(${Math.min(scrollY * 0.15, 15)}px)`,
                opacity: Math.max(1 - scrollY * 0.002, 0),
              }}
            >
              <button
                className="group px-8 cursor-pointer py-4 bg-gradient-to-r from-emerald-600 to-green-600 text-white rounded-full font-semibold text-lg hover:shadow-2xl hover:shadow-emerald-500/30 transition-all transform hover:scale-105 flex items-center space-x-2"
                onClick={() => router.push("/login")}
              >
                <span>Start Learning Free</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </div>

          
          <div className="absolute top-1/4 left-10 animate-bounce">
            <div className="w-20 h-20 bg-emerald-500/20 rounded-full blur-xl"></div>
          </div>
          <div className="absolute top-1/3 right-10 animate-bounce delay-1000">
            <div className="w-32 h-32 bg-green-500/20 rounded-full blur-xl"></div>
          </div>
        </div>
      </section>

      
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-white/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-emerald-600 to-green-600 bg-clip-text text-transparent">
                Supercharge Your Learning
              </span>
            </h2>
            <p className="text-slate-600 text-lg">
              Everything you need to excel in your studies
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative bg-white backdrop-blur-sm border border-green-200 rounded-2xl p-6 hover:border-emerald-400 transition-all duration-300 hover:transform hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/10 animate-fadeInUp"
                style={{
                  animationDelay: `${index * 0.1}s`,
                }}
              >
                <div
                  className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-md`}
                >
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">
                  {feature.title}
                </h3>
                <p className="text-slate-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                How It Works
              </span>
            </h2>
            <p className="text-slate-600 text-lg">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Your Material",
                desc: "Add notes, textbooks, or any study content",
              },
              {
                step: "02",
                title: "AI Analyzes & Learns",
                desc: "Our AI understands your content and learning style",
              },
              {
                step: "03",
                title: "Start Studying",
                desc: "Get personalized quizzes, summaries, and insights",
              },
            ].map((item, index) => (
              <div key={index} className="relative text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-emerald-600 to-green-600 rounded-full text-3xl font-bold mb-6 shadow-lg shadow-emerald-500/30 text-white">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-slate-900">
                  {item.title}
                </h3>
                <p className="text-slate-600">{item.desc}</p>
                {index < 2 && (
                  <div className="hidden md:block absolute top-10 left-full w-full h-0.5 bg-gradient-to-r from-emerald-500 to-transparent -translate-x-1/2"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-12 shadow-2xl shadow-emerald-500/20">
          <TrendingUp className="w-16 h-16 mx-auto mb-6 text-white animate-bounce" />
          <h2 className="text-4xl font-bold mb-4 text-white">
            Ready to Transform Your Learning?
          </h2>
          <p className="text-xl mb-8 text-emerald-50">
            Join thousands of students already studying smarter
          </p>
          <button
            className="px-10 cursor-pointer py-4 bg-white text-emerald-600 rounded-full font-bold text-lg hover:shadow-2xl transition-all transform hover:scale-105 flex items-center space-x-2 mx-auto"
            onClick={() => router.push("/login")}
          >
            <span>Get Started Now</span>
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-green-200 bg-white/50">
        <div className="max-w-7xl mx-auto text-center text-slate-600">
          <p>&copy; 2024 StudyAI. All rights reserved.</p>
          <div className="flex justify-center space-x-6 mt-4">
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Terms
            </a>
            <a href="#" className="hover:text-emerald-600 transition-colors">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
