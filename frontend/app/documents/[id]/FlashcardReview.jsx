"use client";
import React, { useState, useEffect } from "react";
import axios from "../../../utils/api";
import {
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { exportFlashcardsToPDF } from "../../../utils/pdfExport";

function FlashcardReview({ setId, onBack }) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [shuffleKey, setShuffleKey] = useState(0);

  useEffect(() => {
    if (setId) {
      setLoading(true);
      axios
        .get(`/documents/flashcards/${setId}`)
        .then((res) => {
          setCards(res.data.flashcards);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to load cards:", err);
          setLoading(false);
          onBack();
        });
      setIdx(0);
      setFlipped(false);
      setShuffleKey((k) => k + 1);
    }
  }, [setId, onBack]);

  if (loading) return <div className="text-center">Loading cards...</div>;

  if (!cards.length) {
    return (
      <div className="text-center">
        <div className="mb-4">No cards found in this set.</div>
        <button
          onClick={onBack}
          className="text-gray-500 hover:text-green-700 text-sm"
        >
          &larr; Back to Sets
        </button>
      </div>
    );
  }

  const card = cards[idx];

  return (
    <div className="flex flex-col items-center w-full max-w-xl mx-auto">
      <button
        onClick={onBack}
        className="mb-4 cursor-pointer text-gray-500 hover:text-green-700 text-sm self-start"
      >
        &larr; Back to Sets
      </button>

      <div className="flex gap-4 mb-4 w-full justify-end">
        <button
          className="flex items-center cursor-pointer gap-1 px-3 py-1 rounded-lg bg-green-100 hover:bg-green-200 text-green-700 font-semibold shadow transition"
          onClick={() => setFlipped((f) => !f)}
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
              d="M19.428 15.341A8 8 0 118.659 4.572M22 12h-4m0 0l2 2m-2-2l2-2"
            />
          </svg>
          Flip Card
        </button>
        <button
          className="flex items-center cursor-pointer gap-1 px-3 py-1 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold shadow transition"
          onClick={() => {
            let newIdx = idx;
            while (cards.length > 1 && newIdx === idx) {
              newIdx = Math.floor(Math.random() * cards.length);
            }
            setIdx(newIdx);
            setFlipped(false);
          }}
        >
          <ArrowsRightLeftIcon className="w-5 h-5" />
          Shuffle
        </button>
        <button
          className="flex items-center cursor-pointer gap-1 px-3 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold shadow transition"
          onClick={() => exportFlashcardsToPDF(cards, `Flashcard_Set_${setId}`)}
          title="Export to PDF"
        >
          <ArrowDownTrayIcon className="w-5 h-5" />
          Export PDF
        </button>
      </div>

      <div className="relative w-full flex flex-col items-center">
        <div className="[perspective:1200px] w-full flex justify-center">
          <div
            className={`relative w-full max-w-md h-64 [transform-style:preserve-3d] transition-transform duration-500 ${
              flipped ? "rotate-y-180" : ""
            }`}
            style={{ minHeight: "16rem" }}
            onClick={() => setFlipped((f) => !f)}
          >
            <div className="absolute w-full h-full rounded-3xl shadow-2xl bg-gradient-to-br from-white to-green-100 flex flex-col items-center justify-center cursor-pointer [backface-visibility:hidden] border-2 border-green-200 hover:shadow-green-200 hover:border-green-400 transition-all duration-300 p-4 overflow-hidden">
              <span className="inline-block bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow flex-shrink-0">
                Question
              </span>
              <div className="flex-1 overflow-y-auto w-full flex items-center justify-center scrollbar-hide">
                <span className="text-xl font-semibold text-gray-800 text-center px-2 select-none break-words">
                  {card.question}
                </span>
              </div>
            </div>

            <div className="absolute w-full h-full rounded-3xl shadow-2xl bg-gradient-to-br from-green-500 to-green-300 flex flex-col items-center justify-center cursor-pointer [backface-visibility:hidden] rotate-y-180 border-2 border-green-400 hover:shadow-green-400 hover:border-green-500 transition-all duration-300 p-4 overflow-hidden">
              <span className="inline-block bg-white text-green-700 text-xs font-bold px-3 py-1 rounded-full mb-3 shadow flex-shrink-0">
                Answer
              </span>
              <div className="flex-1 overflow-y-auto w-full flex items-center justify-center scrollbar-hide">
                <span className="text-xl font-semibold text-white text-center px-2 select-none break-words">
                  {card.answer}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 justify-center mt-6 mb-2">
          {cards.map((_, i) => (
            <span
              key={i}
              className={`transition-all duration-300 h-2 ${
                i === idx ? "w-6 bg-green-500" : "w-2 bg-gray-300"
              } rounded-full inline-block`}
            />
          ))}
        </div>

        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => {
              setIdx((i) => Math.max(i - 1, 0));
              setFlipped(false);
            }}
            disabled={idx === 0}
            className={`p-2 cursor-pointer rounded-full transition shadow ${
              idx === 0
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-green-100 text-green-700"
            }`}
            title="Previous"
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <span className="text-gray-600 font-medium text-lg">
            {idx + 1} / {cards.length}
          </span>
          <button
            onClick={() => {
              setIdx((i) => Math.min(i + 1, cards.length - 1));
              setFlipped(false);
            }}
            disabled={idx === cards.length - 1}
            className={`p-2 cursor-pointer rounded-full transition shadow ${
              idx === cards.length - 1
                ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                : "bg-white hover:bg-green-100 text-green-700"
            }`}
            title="Next"
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
        <div className="text-xs text-gray-400 mt-2 select-none">
          Click card or use actions to flip
        </div>
      </div>
    </div>
  );
}

export default FlashcardReview;
