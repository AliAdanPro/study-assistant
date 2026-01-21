"use client";
import React, { useState, useEffect } from "react";
import api from "../../../utils/api";
import { useNotification } from "../../../context/NotificationContext";
import { exportQuizResultsToPDF } from "../../../utils/pdfExport";
import {
  TrashIcon,
  TrophyIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
export default function QuizzesTab({ documentId }) {
  const [quizzes, setQuizzes] = useState([]);
  const [showGenModal, setShowGenModal] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [loading, setLoading] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteQuizId, setDeleteQuizId] = useState(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchQuizzes();
  }, [documentId]);

  async function fetchQuizzes() {
    const res = await api.get(`/documents/${documentId}/quizzes`);
    setQuizzes(res.data.quizzes);
  }

  async function handleGenerateQuiz() {
    setLoading(true);
    await api.post(`/documents/${documentId}/quizzes/generate`, {
      numQuestions,
    });
    setShowGenModal(false);
    setNumQuestions(5);
    await fetchQuizzes();
    showSuccess("Quiz generated Successfully!");
    setLoading(false);
  }
  function markQuizCompleted(quizId) {
    setQuizzes((prev) =>
      prev.map((q) => (q.id === quizId ? { ...q, completed: true } : q))
    );
  }

  return (
    <div>
      <div className="flex justify-end mb-8">
        <button
          onClick={() => setShowGenModal(true)}
          className={`bg-green-500 hover:bg-green-600 cursor-pointer text-white rounded-lg px-6 py-2 font-semibold transition flex items-center gap-2 shadow-md`}
        >
          <SparklesIcon className="h-5 w-5" />
          Generate Quiz
        </button>
      </div>
      {showGenModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 animate-fade-in backdrop-blur-sm">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="font-bold mb-2">How many MCQs?</h2>
            <input
              type="number"
              min={1}
              max={20}
              value={numQuestions}
              onChange={(e) => setNumQuestions(Number(e.target.value))}
              className="border px-2 py-1 rounded w-20"
            />
            <div className="flex gap-2 mt-4">
              <button
                className="bg-green-500 text-white px-4 py-1 hover:bg-green-600 rounded-lg cursor-pointer"
                onClick={handleGenerateQuiz}
                disabled={loading}
              >
                {loading ? "Generating..." : "Generate"}
              </button>
              <button
                className="bg-gray-300 px-4 py-1 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                onClick={() => setShowGenModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
        {quizzes.length === 0 ? (
          <div className="text-gray-400 text-center text-lg py-12 animate-fade-in">
            No quizzes yet
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {quizzes.map((quiz) => (
              <QuizCard
                key={quiz.id}
                quiz={quiz}
                onStart={() => setActiveQuiz(quiz.id)}
                onDelete={() => {
                  setDeleteQuizId(quiz.id);
                  setShowDeleteBox(true);
                }}
              />
            ))}
          </div>
        )}
      </div>
      {activeQuiz && (
        <QuizTake
          quizId={activeQuiz}
          onClose={() => setActiveQuiz(null)}
          completed={quizzes.find((q) => q.id === activeQuiz)?.completed}
          onQuizCompleted={markQuizCompleted}
        />
      )}

      {showDeleteBox && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative animate-fade-in">
            <button
              type="button"
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
              onClick={() => {
                setShowDeleteBox(false);
                setDeleteQuizId(null);
              }}
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
                Delete Quiz?
              </h2>
              <p className="text-gray-500 mb-6 text-center">
                Are you sure you want to delete this quiz? This action cannot be
                undone.
              </p>
              <div className="flex gap-4">
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-400 transition cursor-pointer font-medium"
                  onClick={() => {
                    setShowDeleteBox(false);
                    setDeleteQuizId(null);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-6 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition cursor-pointer"
                  onClick={async () => {
                    setShowDeleteBox(false);
                    if (!deleteQuizId) return;
                    await api.delete(`/documents/quizzes/${deleteQuizId}`);
                    showSuccess("Quiz deleted Successfully!");
                    setQuizzes((prev) =>
                      prev.filter((q) => q.id !== deleteQuizId)
                    );
                    setDeleteQuizId(null);
                  }}
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

function QuizCard({ quiz, onStart, onDelete }) {
  return (
    <div className="relative border-2 border-green-200 rounded-xl p-6 flex flex-col gap-2 shadow bg-white hover:shadow-lg transition-shadow group">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete && onDelete();
        }}
        className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 z-10"
        style={{ right: "1rem", top: "0.5rem" }}
        title="Delete"
      >
        <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" />
      </button>
      <div className="text-lg font-semibold">Quiz</div>
      <div className="text-xs text-gray-500">
        Created {new Date(quiz.created_at).toLocaleDateString()}
      </div>
      <div className="text-sm">{quiz.num_questions} Questions</div>
      {quiz.completed ? (
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded mt-2 hover:bg-gray-300 transition cursor-pointer"
          onClick={onStart}
        >
          View Results
        </button>
      ) : (
        <button
          className="bg-green-500 text-white px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 mt-2"
          onClick={onStart}
        >
          Start Quiz
        </button>
      )}
    </div>
  );
}

function QuizTake({ quizId, onClose, completed, onQuizCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [review, setReview] = React.useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    api.get(`/documents/quizzes/${quizId}/questions`).then((res) => {
      setQuestions(res.data.questions);
      setAnswers(Array(res.data.questions.length).fill(null));
    });
  }, [quizId]);

  useEffect(() => {
    if (completed && !review && questions.length) {
      api.get(`/documents/quizzes/${quizId}/questions`).then((res) => {
        setReview({
          score: res.data.questions.filter(
            (q) => q.user_answer === q.correct_option
          ).length,
          total: res.data.questions.length,
          questions: res.data.questions,
        });
      });
    }
  }, [completed, review, questions.length, quizId]);

  function handleSelect(idx, optIdx) {
    if (completed) return;
    const newAns = [...answers];
    newAns[idx] = optIdx;
    setAnswers(newAns);
  }

  async function handleSubmit() {
    if (completed) return;
    const storedUser = localStorage.getItem("user");
    let userId = null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      userId = parsed.id || parsed.userId || parsed._id;
    }
    const res = await api.post(`/documents/quizzes/${quizId}/submit`, {
      answers,
      userId,
    });
    setResult(res.data);
    setSubmitted(true);
    if (onQuizCompleted) {
      onQuizCompleted(quizId);
    }
  }

  if (!questions.length) return <div>Loading...</div>;
  if ((submitted && result) || completed) {
    const display = result || review;
    if (!display) return <div>Loading...</div>;

    if (!showReview && submitted && result) {
      const percent = (display.score / display.total) * 100;
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 animate-fade-in backdrop-blur-sm">
          <div
            className="bg-white p-8 rounded shadow-lg max-w-lg w-full flex flex-col items-center justify-center"
            style={{
              maxHeight: "90vh",
              minHeight: "220px",
              animation: "fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <h2 className="text-2xl font-bold mb-4">Quiz Results</h2>
            <div className="text-xl font-semibold mb-6">
              Score: {display.score} / {display.total}
            </div>
            {percent === 100 ? (
              <div className="flex flex-col items-center mb-4 animate-bounce">
                <TrophyIcon className="w-16 h-16 text-yellow-400 drop-shadow-lg" />
                <div className="text-lg font-bold text-yellow-600 mt-2 animate-fade-in">
                  🏆 Perfect Score! Amazing work!
                </div>
                <div className="text-sm text-gray-500 mt-1 animate-fade-in">
                  You mastered this quiz. Keep it up!
                </div>
              </div>
            ) : percent < 50 ? (
              <div className="flex flex-col items-center mb-4 animate-shake">
                <ExclamationCircleIcon className="w-14 h-14 text-red-500" />
                <div className="text-lg font-bold text-red-500 mt-2 animate-fade-in">
                  Don't give up!
                </div>
                <div className="text-sm text-gray-500 mt-1 animate-fade-in">
                  Score below 50%. Review the material and try again.
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center mb-4 animate-fade-in">
                <div className="text-lg font-bold text-green-500">
                  Good job! Keep practicing!
                </div>
              </div>
            )}
            <div className="flex gap-4">
              <button
                className="bg-gray-300 text-gray-700 px-4 py-2 cursor-pointer rounded hover:bg-gray-400 transition"
                onClick={onClose}
              >
                Close
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 cursor-pointer rounded hover:bg-blue-600 transition flex items-center gap-2"
                onClick={() => {
                  const questionsWithOptions = questions.map((q) => ({
                    ...q,
                    option_a: q.options[0],
                    option_b: q.options[1],
                    option_c: q.options[2],
                    option_d: q.options[3],
                    user_answer: answers[questions.indexOf(q)],
                  }));
                  exportQuizResultsToPDF(
                    questionsWithOptions,
                    display.score,
                    display.total,
                    `Quiz_${quizId}`
                  );
                }}
              >
                <ArrowDownTrayIcon className="w-5 h-5" />
                Export PDF
              </button>
            </div>
          </div>
          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(40px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes bounce {
              0%,
              100% {
                transform: translateY(0);
              }
              50% {
                transform: translateY(-12px);
              }
            }
            .animate-bounce {
              animation: bounce 1s infinite;
            }
            @keyframes shake {
              0% {
                transform: translateX(0);
              }
              20% {
                transform: translateX(-8px);
              }
              40% {
                transform: translateX(8px);
              }
              60% {
                transform: translateX(-8px);
              }
              80% {
                transform: translateX(8px);
              }
              100% {
                transform: translateX(0);
              }
            }
            .animate-shake {
              animation: shake 0.6s;
            }
          `}</style>
        </div>
      );
    }

    if (completed || showReview) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 animate-fade-in backdrop-blur-sm">
          <div
            className="bg-white p-8 rounded shadow-lg max-w-lg w-full flex flex-col"
            style={{
              maxHeight: "90vh",
              minHeight: "300px",
              animation: "fadeInUp 0.5s cubic-bezier(0.4,0,0.2,1)",
            }}
          >
            <h2 className="text-2xl font-bold mb-2">Quiz Results</h2>
            <div className="mb-4">
              Score: {display.score} / {display.total}
            </div>
            <div
              className="overflow-y-auto pr-2"
              style={{ maxHeight: "45vh", minHeight: "120px" }}
            >
              {display.questions.map((q, i) => (
                <div key={q.id} className="mb-4">
                  <div className="font-semibold mb-1">{q.question}</div>
                  <div>
                    {q.options.map((opt, j) => {
                      const isCorrect = j === q.correct_option;
                      const isUser = j === q.user_answer;
                      const userAnswered = typeof q.user_answer === "number";
                      return (
                        <div
                          key={j}
                          className={`px-2 py-1 rounded mb-1 transition-all duration-300 ${
                            isCorrect
                              ? "bg-green-100 text-green-700 animate-pop"
                              : isUser && userAnswered
                              ? "bg-red-100 text-red-700 animate-pop"
                              : "bg-gray-100"
                          }`}
                          style={{
                            boxShadow: isCorrect
                              ? "0 0 0 2px #22c55e33"
                              : isUser && userAnswered
                              ? "0 0 0 2px #ef444433"
                              : undefined,
                          }}
                        >
                          {opt}
                          {isCorrect && " (Correct)"}
                          {isUser &&
                            !isCorrect &&
                            userAnswered &&
                            " (Your answer)"}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
            <button
              className="bg-green-500 text-white px-4 py-2 cursor-pointer rounded mt-4 hover:bg-green-600 transition"
              onClick={onClose}
            >
              Close
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 cursor-pointer rounded mt-4 ml-2 hover:bg-blue-600 transition flex items-center justify-center gap-2"
              onClick={() => {
                const questionsWithOptions = display.questions.map((q) => ({
                  ...q,
                  option_a: q.options[0],
                  option_b: q.options[1],
                  option_c: q.options[2],
                  option_d: q.options[3],
                }));
                exportQuizResultsToPDF(
                  questionsWithOptions,
                  display.score,
                  display.total,
                  `Quiz_${quizId}`
                );
              }}
            >
              <ArrowDownTrayIcon className="w-5 h-5" />
              Export PDF
            </button>
          </div>
          <style jsx>{`
            @keyframes fadeInUp {
              from {
                opacity: 0;
                transform: translateY(40px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
            .animate-fade-in {
              animation: fadeInUp 0.5s cubic-bezier(0.4, 0, 0.2, 1);
            }
            @keyframes pop {
              0% {
                transform: scale(0.95);
              }
              60% {
                transform: scale(1.04);
              }
              100% {
                transform: scale(1);
              }
            }
            .animate-pop {
              animation: pop 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }
          `}</style>
        </div>
      );
    }
  }

  const q = questions[step];
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50 animate-fade-in backdrop-blur-sm">
      <div className="bg-white p-8 rounded shadow-lg max-w-lg w-full">
        <div className="mb-2 text-gray-500">
          Question {step + 1} / {questions.length}
        </div>
        <div className="font-semibold mb-4">{q.question}</div>
        <div className="flex flex-col gap-2">
          {q.options.map((opt, i) => (
            <label
              key={i}
              className={`px-3 py-2 rounded border cursor-pointer ${
                answers[step] === i
                  ? "border-green-500 bg-green-50"
                  : "border-gray-200"
              }`}
            >
              <input
                type="radio"
                name={`q${step}`}
                checked={answers[step] === i}
                onChange={() => handleSelect(step, i)}
                className="mr-2"
              />
              {opt}
            </label>
          ))}
        </div>
        <div className="flex gap-2 mt-6">
          <button
            className="px-4 py-2 rounded-lg cursor-pointer bg-gray-200"
            onClick={onClose}
          >
            Cancel
          </button>
          {step > 0 && (
            <button
              className="px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600  bg-gray-200"
              onClick={() => setStep((s) => s - 1)}
            >
              Previous
            </button>
          )}
          {step < questions.length - 1 ? (
            <button
              className="px-4 py-2 rounded-lg cursor-pointer hover:bg-green-600 bg-green-500 text-white"
              onClick={() => setStep((s) => s + 1)}
              disabled={answers[step] === null}
            >
              Next
            </button>
          ) : (
            <button
              className="px-4 py-2 rounded-lg cursor-pointer bg-green-500 hover:bg-green-600 text-white"
              onClick={handleSubmit}
              disabled={answers.some((a) => a === null)}
            >
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
