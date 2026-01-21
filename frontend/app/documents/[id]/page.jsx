"use client";
import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "../../../utils/api";
import Link from "next/link";
import ContentTab from "./ContentTab";
import ChatTab from "./ChatTab";
import SummaryTab from "./SummaryTab";
import FlashcardsTab from "./FlashcardsTab";
import QuizzesTab from "./QuizzesTab";

const TABS = [
  { label: "Content" },
  { label: "Chat" },
  { label: "Summary" },
  { label: "Flashcards" },
  { label: "Quizzes" },
];

export default function DocumentDetailPage() {

  const { id } = useParams();
  const router = useRouter();
  const [doc, setDoc] = useState(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Content");

  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState([]);
  const [chatLoading, setChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const [summary, setSummary] = useState("");
  const [summaryLoading, setSummaryLoading] = useState(false);

  
  let userInitial = "U";
  if (typeof window !== "undefined") {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.name && parsed.name.length > 0) {
          userInitial = parsed.name[0].toUpperCase();
        }
      } catch {}
    }
  }
  useEffect(() => {
    const startTime = Date.now();

    const saveInterval = setInterval(async () => {
      const duration = Math.round((Date.now() - startTime) / 60000);
      if (duration < 1) return;

      const storedUser = localStorage.getItem("user");
      if (!storedUser || !id) return;

      const parsed = JSON.parse(storedUser);
      const userId = parsed.id || parsed.userId || parsed._id;

      try {
        await axios.post(`/documents/${id}/duration`, {
          userId,
          durationMinutes: 1,
        });
        console.log("Saved 1 minute of study time");
      } catch (err) {
        console.error("Failed to save duration:", err);
      }
    }, 60000);

    return () => clearInterval(saveInterval);
  }, [id]);
 
  useEffect(() => {
    if (activeTab === "Summary") {
      setSummaryLoading(true);
      console.log("Summary tab: id =", id);
      axios
        .post(`/documents/${id}/summary`)
        .then((res) => setSummary(res.data.summary))
        .catch(() => setSummary("Failed to generate summary."))
        .finally(() => setSummaryLoading(false));
    }
  }, [activeTab, id]);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser && id) {
      const parsed = JSON.parse(storedUser);
      const userId = parsed.id || parsed.userId || parsed._id;
      axios.post(`/documents/${id}/access`, { userId });
    }
  }, [id]);
  useEffect(() => {
    async function fetchDoc() {
      try {
        const res = await axios.get(`/documents`);
        const found = res.data.find((d) => d.id === Number(id));
        if (!found) {
          setError("Document not found");
        } else {
          setDoc(found);
        }
      } catch {
        setError("Failed to load document");
      }
    }
    fetchDoc();
  }, [id]);

  if (error) {
    return (
      <div className="p-8">
        <button
          onClick={() => router.back()}
          className="text-green-600 underline mb-4 block"
        >
          &larr; Back to Documents
        </button>
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  if (!doc) {
    return <div className="p-8">Loading...</div>;
  }

  const pdfUrl = `http://localhost:5000/uploads/${doc.filename}`;
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    const userMessage = { role: "user", content: chatInput };
    setChatMessages((msgs) => [...msgs, userMessage]);
    setChatLoading(true);
    setChatInput("");
    try {
     
      const res = await axios.post(`/documents/${id}/chat`, {
        question: userMessage.content,
        documentText: doc.text,
      });
      setChatMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: res.data.answer },
      ]);
    } catch {
      setChatMessages((msgs) => [
        ...msgs,
        { role: "assistant", content: "Sorry, I couldn't get an answer." },
      ]);
    }
    setChatLoading(false);
  };
  return (
    <div className="max-w-5xl mx-auto px-2 sm:px-2 md:px-4 lg:px-4">
      <Link
        href="/documents"
        className="text-gray-500 hover:text-green-700 text-sm mb-2 inline-block"
      >
        &larr; Back to Documents
      </Link>
      <h1 className="text-2xl font-bold mb-1">{doc.title || doc.filename}</h1>
      <div className="text-gray-500 mb-6">{doc.description}</div>
      <div className="bg-white rounded-2xl shadow-lg p-0 border border-gray-200">
        {/* Tabs */}
        <div className="flex items-center  px-8 pt-6">
          <div className="flex gap-8 ">
            {TABS.map((tab) => (
              <button
                key={tab.label}
                className={`pb-3 text-sm font-semibold cursor-pointer transition ${
                  activeTab === tab.label
                    ? "border-b-2 cursor-pointer border-green-500 text-green-700"
                    : "text-gray-500 hover:text-green-700"
                }`}
                onClick={() => setActiveTab(tab.label)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="ml-auto">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 text-xs font-medium hover:underline"
            >
              Open in new tab
            </a>
          </div>
        </div>
        
        <div className="px-0 sm:px-2 md:px-4 lg:px-6 py-6 min-h-[500px]">
          {activeTab === "Content" && <ContentTab pdfUrl={pdfUrl} />}
          {activeTab === "Chat" && (
            <ChatTab
              chatMessages={chatMessages}
              chatInput={chatInput}
              setChatInput={setChatInput}
              chatLoading={chatLoading}
              handleChatSubmit={handleChatSubmit}
              chatEndRef={chatEndRef}
              userInitial={userInitial}
            />
          )}
          {activeTab === "Summary" && (
            <SummaryTab
              summary={summary}
              summaryLoading={summaryLoading}
              onClose={() => setActiveTab("Content")}
            />
          )}
          {activeTab === "Flashcards" && <FlashcardsTab documentId={id} />}
          {activeTab === "Quizzes" && <QuizzesTab documentId={id} />}
        </div>
      </div>
    </div>
  );
}
