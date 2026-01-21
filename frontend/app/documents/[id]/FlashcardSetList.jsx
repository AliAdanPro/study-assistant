"use client";
import React, { useState, useEffect } from "react";
import axios from "../../../utils/api";
import { useNotification } from "../../../context/NotificationContext";
import {
  RectangleStackIcon,
  SparklesIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

function FlashcardSetList({ documentId, onSelectSet }) {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSets();
    
  }, [documentId]);

  async function fetchSets() {
    setLoading(true);
    const res = await axios.get(`/documents/${documentId}/flashcards/sets`);
    setSets(res.data.sets);
    setLoading(false);
  }

  async function handleGenerate() {
    setGenerating(true);
    await axios.post(`/documents/${documentId}/flashcards/generate`);
    showSuccess("Flashcard Set generated!");
    await fetchSets();
    setGenerating(false);
  }

 
  const getCardCount = (set) => set.card_count || 10;

  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteSetId, setDeleteSetId] = useState(null);

  function handleDeleteClick(setId) {
    setDeleteSetId(setId);
    setShowDeleteBox(true);
  }

  function handleDeleteCancel() {
    setShowDeleteBox(false);
    setDeleteSetId(null);
  }

  async function handleDeleteConfirm() {
    setShowDeleteBox(false);
    if (!deleteSetId) return;

    
    if (typeof onSelectSet === "function") {
      onSelectSet(null);
    }

    try {
      await axios.delete(`/documents/flashcards/${deleteSetId}`);
      setSets((prev) => prev.filter((s) => s.id !== deleteSetId));
      showSuccess("Flashcard set deleted!");
    } catch (err) {
      alert("Failed to delete set.");
    }
    setDeleteSetId(null);
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <div className="font-bold text-xl mb-1">Your Flashcard Sets</div>
          <div className="text-gray-400 text-sm">
            {sets.length} set{sets.length !== 1 ? "s" : ""} available
          </div>
        </div>
        <button
          onClick={handleGenerate}
          className={`${
            generating
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 cursor-pointer"
          } text-white rounded-lg px-6 py-2 font-semibold transition flex items-center gap-2 shadow-md`}
          disabled={generating}
        >
          {generating ? (
            <>
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <SparklesIcon className="h-5 w-5" /> Generate New Set
            </>
          )}
        </button>
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {loading ? (
          <div>Loading sets...</div>
        ) : sets.length === 0 ? (
          <div className="text-gray-400 text-center">
            No flashcard sets yet.
          </div>
        ) : (
          <div className="flex flex-wrap gap-8">
            {sets.map((set) => (
              <div
                key={set.id}
                className="relative border-2 border-green-200 rounded-2xl bg-white p-6 flex flex-col gap-4 min-w-[320px] max-w-[340px] cursor-pointer hover:shadow-lg transition group"
                onClick={() => onSelectSet(set.id)}
                style={{ boxShadow: "0 4px 24px 0 rgba(34,197,94,0.07)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-green-50 rounded-full p-4 flex items-center justify-center">
                    <RectangleStackIcon className="h-8 w-8 text-green-400" />
                  </div>
                  <button
                    type="button"
                    className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 z-10"
                    style={{ right: "1rem", top: "0.5rem" }}
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteClick(set.id);
                    }}
                  >
                    <TrashIcon className="h-5 w-5 text-red-500 cursor-pointer" />
                  </button>
                </div>
                <div className="mt-2">
                  <div className="font-bold text-lg">Flashcard Set</div>
                  <div className="text-xs text-gray-400 mt-1">
                    CREATED{" "}
                    {new Date(set.created_at)
                      .toLocaleDateString(undefined, {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })
                      .toUpperCase()}
                  </div>
                </div>
                <div className="mt-4">
                  <span className="inline-block bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-2 text-sm font-semibold shadow-sm">
                    {getCardCount(set)} cards
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    
      {showDeleteBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative animate-fade-in">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
              onClick={handleDeleteCancel}
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
            <div className="flex flex-col items-center">
              <TrashIcon className="w-12 h-12 text-red-500 mb-4" />
              <h2 className="text-xl font-semibold mb-2 text-gray-900">
                Delete Flashcard Set?
              </h2>
              <p className="text-gray-500 mb-6 text-center">
                Are you sure you want to delete this flashcard set? This action
                cannot be undone.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 cursor-pointer font-medium"
                  onClick={handleDeleteCancel}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition cursor-pointer"
                  onClick={handleDeleteConfirm}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FlashcardSetList;
