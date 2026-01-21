"use client";
import React, { useRef, useEffect } from "react";
import { PaperAirplaneIcon, CpuChipIcon } from "@heroicons/react/24/outline";
import ReactMarkdown from "react-markdown";

export default function ChatTab({
  chatMessages,
  chatInput,
  setChatInput,
  chatLoading,
  handleChatSubmit,
  chatEndRef,
  userInitial,
}) {
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatMessages, chatLoading, chatEndRef]);

  return (
    <div className="flex flex-col h-[450px] min-h-[450px]">
      <div className="flex-1 min-h-0 overflow-y-auto mb-4 bg-gray-50 rounded-xl p-8 flex flex-col">
        {chatMessages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full">
            <div className="bg-green-50 rounded-full p-4 mb-4">
              <PaperAirplaneIcon className="w-10 h-10 text-green-400" />
            </div>
            <div className="font-semibold text-lg mb-2">
              Start a conversation
            </div>
            <div className="text-gray-500 text-sm text-center">
              Ask me anything about the document!
            </div>
          </div>
        ) : (
          <div className="w-full max-w-2xl mx-auto space-y-6">
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex items-end gap-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "assistant" && (
                  <>
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-200">
                      <CpuChipIcon
                        className="w-5 h-5 text-green-700"
                        title="AI"
                      />
                    </div>
                    <div
                      className={`px-4 py-2 rounded-xl bg-gray-100 text-gray-900 max-w-[80%] break-words whitespace-pre-wrap`}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                  </>
                )}
                {msg.role === "user" && (
                  <>
                    <div
                      className={`px-4 py-2 rounded-xl bg-green-100 text-green-900 max-w-[80%] break-words whitespace-pre-wrap`}
                    >
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-green-500 text-white font-bold">
                      {userInitial}
                    </div>
                  </>
                )}
              </div>
            ))}
            {chatLoading && (
              <div className="flex justify-start">
                <div className="px-4 py-2 rounded-xl bg-gray-100 text-gray-400">
                  Thinking...
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        )}
      </div>
      <form
        onSubmit={handleChatSubmit}
        className="flex items-center gap-2 pt-4"
      >
        <input
          type="text"
          className="flex-1 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 shadow-sm border border-gray-200"
          placeholder="Type your question about the document..."
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          disabled={chatLoading}
        />
        <button
          type="submit"
          className="bg-green-500 cursor-pointer hover:bg-green-600 text-white rounded-lg p-2 transition disabled:opacity-60"
          disabled={chatLoading || !chatInput.trim()}
        >
          <PaperAirplaneIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
