import React, { useState, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { exportSummaryToPDF } from "../../../utils/pdfExport";

export default function SummaryTab({ summary, summaryLoading, onClose, documentTitle = "Document" }) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const utteranceRef = useRef(null);

  
  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = window.speechSynthesis.getVoices();
      setVoices(availableVoices);
     
      const englishVoice = availableVoices.find((v) => v.lang.startsWith("en"));
      if (englishVoice) setSelectedVoice(englishVoice);
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  
  const getPlainText = (markdown) => {
    return markdown
      .replace(/#{1,6}\s?/g, "") 
      .replace(/\*\*(.+?)\*\*/g, "$1") 
      .replace(/\*(.+?)\*/g, "$1") 
      .replace(/`(.+?)`/g, "$1") 
      .replace(/```[\s\S]*?```/g, "") 
      .replace(/\[(.+?)\]\(.+?\)/g, "$1") 
      .replace(/[-*+]\s/g, "") 
      .replace(/\n+/g, ". ") 
      .trim();
  };

  const handleSpeak = () => {
    if (!summary) return;

    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
      setIsSpeaking(true);
      return;
    }

   
    window.speechSynthesis.cancel();

    const plainText = getPlainText(summary);
    const utterance = new SpeechSynthesisUtterance(plainText);

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    utterance.rate = rate;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  const handlePause = () => {
    window.speechSynthesis.pause();
    setIsPaused(true);
    setIsSpeaking(false);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setIsPaused(false);
  };

  const handleClose = () => {
    window.speechSynthesis.cancel();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative animate-fade-in">
        <button
          type="button"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
          onClick={handleClose}
          aria-label="Close"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold mb-4 text-gray-900">
          Generated Summary
        </h2>
        {summaryLoading ? (
          <div>Generating summary...</div>
        ) : (
          <>
            
            <div className="flex items-center gap-2 mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-100">
              
              {!isSpeaking && !isPaused ? (
                <button
                  onClick={handleSpeak}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  title="Read Aloud"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-sm font-medium">Listen</span>
                </button>
              ) : isSpeaking ? (
                <button
                  onClick={handlePause}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  title="Pause"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                  <span className="text-sm font-medium">Pause</span>
                </button>
              ) : (
                <button
                  onClick={handleSpeak}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  title="Resume"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-sm font-medium">Resume</span>
                </button>
              )}

              
              {(isSpeaking || isPaused) && (
                <button
                  onClick={handleStop}
                  className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-red-500 to-rose-500 text-white rounded-lg hover:from-red-600 hover:to-rose-600 transition-all shadow-md hover:shadow-lg cursor-pointer"
                  title="Stop"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 6h12v12H6z" />
                  </svg>
                  <span className="text-sm font-medium">Stop</span>
                </button>
              )}

             
              <button
                onClick={() => exportSummaryToPDF(summary, documentTitle)}
                className="p-2 rounded-lg bg-white text-gray-500 hover:bg-blue-100 hover:text-blue-600 transition-all cursor-pointer"
                title="Export to PDF"
              >
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
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </button>

              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`ml-auto p-2 rounded-lg transition-all cursor-pointer ${
                  showSettings
                    ? "bg-green-200 text-green-700"
                    : "bg-white text-gray-500 hover:bg-green-100 hover:text-green-600"
                }`}
                title="Voice Settings"
              >
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
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </button>

              
              {isSpeaking && (
                <div className="flex items-center gap-1 ml-2">
                  <div className="flex gap-0.5">
                    <span className="w-1 h-4 bg-green-500 rounded-full animate-pulse"></span>
                    <span
                      className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.1s" }}
                    ></span>
                    <span
                      className="w-1 h-4 bg-green-500 rounded-full animate-pulse"
                      style={{ animationDelay: "0.2s" }}
                    ></span>
                  </div>
                </div>
              )}
            </div>

            
            {showSettings && (
              <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-4">
               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Voice
                  </label>
                  <select
                    value={selectedVoice?.name || ""}
                    onChange={(e) => {
                      const voice = voices.find(
                        (v) => v.name === e.target.value
                      );
                      setSelectedVoice(voice);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {voices.map((voice) => (
                      <option key={voice.name} value={voice.name}>
                        {voice.name} ({voice.lang})
                      </option>
                    ))}
                  </select>
                </div>

               
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Speed: {rate}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={rate}
                    onChange={(e) => setRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0.5x</span>
                    <span>1x</span>
                    <span>1.5x</span>
                    <span>2x</span>
                  </div>
                </div>
              </div>
            )}

            <div className="prose max-w-none text-gray-800 max-h-[60vh] overflow-y-auto pr-2">
              <ReactMarkdown>{summary}</ReactMarkdown>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
