"use client";
import { useState, useEffect, useRef } from "react";
import axios from "../../utils/api";
import Link from "next/link";
import { useNotification } from "../../context/NotificationContext";
import {
  DocumentIcon,
  BookOpenIcon,
  ClipboardDocumentCheckIcon,
  UserIcon,
  TrashIcon,
  ArrowUpTrayIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function timeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 172800) return "a day ago";
  return `${Math.floor(diff / 86400)} days ago`;
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState([]);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [showDeleteBox, setShowDeleteBox] = useState(false);
  const [deleteDocId, setDeleteDocId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const deleteButtonRef = useRef(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsLoading(true);
    try {
      const storedUser = localStorage.getItem("user");
      let userId = null;
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        userId = parsed.id || parsed.userId || parsed._id;
      }
      const res = await axios.get(
        `/documents${userId ? `?userId=${userId}` : ""}`
      );
      const docs = res.data;

      const docsWithCounts = await Promise.all(
        docs.map(async (doc) => {
          let flashcards = 0;
          let quizzes = 0;
          try {
            const setsRes = await axios.get(
              `/documents/${doc.id}/flashcards/sets`
            );
            const sets = setsRes.data.sets || [];

            if (sets.length > 0) {
              flashcards = sets.reduce(
                (sum, set) => sum + (set.card_count || 0),
                0
              );

              if (flashcards === 0) flashcards = sets.length;
            }
          } catch {}
          try {
            const quizRes = await axios.get(`/documents/${doc.id}/quizzes`);
            quizzes = (quizRes.data.quizzes || []).length;
          } catch {}
          return { ...doc, flashcards, quizzes };
        })
      );
      setDocuments(docsWithCounts);
    } catch (err) {
      setError("Failed to fetch documents");
    }
    setIsLoading(false);
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;
    setUploading(true);
    setError("");

    const storedUser = localStorage.getItem("user");
    let userId = null;
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      userId = parsed.id || parsed.userId || parsed._id;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("user_id", userId);
    try {
      await axios.post("/documents/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      setShowModal(false);
      showSuccess("Document uploaded!");
      fetchDocuments();
    } catch (err) {
      setError("Upload failed");
    }
    setUploading(false);
  };

  const handleDeleteClick = (id) => {
    setDeleteDocId(id);
    setShowDeleteBox(true);
  };

  const handleDeleteConfirm = async () => {
    setShowDeleteBox(false);
    try {
      await axios.delete(`/documents/${deleteDocId}`);
      setDocuments((docs) => docs.filter((doc) => doc.id !== deleteDocId));
      showSuccess("Document deleted!");
    } catch (err) {
      setError("Delete failed");
    }
    setDeleteDocId(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteBox(false);
    setDeleteDocId(null);
  };

  const filteredDocuments = documents.filter((doc) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    const title = (doc.title || "").toLowerCase();
    const filename = (doc.filename || "").toLowerCase();
    return title.includes(query) || filename.includes(query);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
          <span className="text-gray-500 font-medium">
            Loading documents...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <main className="flex-1">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-1">My Documents</h1>
            <p className="text-gray-500 text-base">
              Manage and organize your learning materials
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2 rounded-lg cursor-pointer transition flex items-center"
          >
            + Upload Document
          </button>
        </div>

        <div className="relative mb-6 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-8 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400 focus:border-transparent bg-white shadow-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
            </button>
          )}
        </div>

        {error && <div className="text-red-500 mb-4">{error}</div>}
        {filteredDocuments.length === 0 ? (
          <div className="text-gray-500 text-center py-8">
            {searchQuery
              ? "No documents match your search"
              : "No document uploaded"}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredDocuments.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-2xl shadow p-6 flex flex-col gap-4 group relative cursor-pointer transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <button
                  type="button"
                  onClick={() => handleDeleteClick(doc.id)}
                  className="absolute top-2 right-3 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-red-100 z-10"
                  style={{ right: "1rem", top: "0.5rem" }}
                  title="Delete"
                  ref={deleteButtonRef}
                >
                  <TrashIcon className="w-5 h-5 text-red-500 cursor-pointer" />
                </button>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-3 rounded-xl">
                    <DocumentIcon className="w-8 h-8 text-green-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className="font-semibold text-lg text-gray-900 truncate max-w-[10rem] md:max-w-[12rem] lg:max-w-[14rem]"
                      title={doc.title || doc.filename}
                    >
                      {doc.title || doc.filename}
                    </div>
                    <div className="text-xs text-gray-400">
                      {formatFileSize(doc.filesize)}
                    </div>
                  </div>
                </div>
                <div className="flex gap-3 mt-2">
                  <span className="flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded">
                    {doc.flashcards} Flashcards
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-green-600 bg-green-50 px-2 py-1 rounded">
                    {doc.quizzes} Quizzes
                  </span>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center text-gray-400 text-xs gap-1">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    {doc.uploaded_at ? (
                      <span>Uploaded {timeAgo(doc.uploaded_at)}</span>
                    ) : (
                      <span>Uploaded just now</span>
                    )}
                  </div>
                  <Link
                    href={`/documents/${doc.id}`}
                    className="text-green-600 hover:underline text-sm font-medium"
                  >
                    View
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {showDeleteBox && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-8 relative animate-fade-in">
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 cursor-pointer"
                onClick={handleDeleteCancel}
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <div className="flex flex-col items-center">
                <TrashIcon className="w-12 h-12 text-red-500 mb-4" />
                <h2 className="text-xl font-semibold mb-2 text-gray-900">
                  Delete Document?
                </h2>
                <p className="text-gray-500 mb-6 text-center">
                  Are you sure you want to delete this document? This action
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

        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/10">
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8 relative animate-fade-in">
              <button
                type="button"
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
                onClick={() => {
                  setShowModal(false);
                  setSelectedFile(null);
                }}
                aria-label="Close"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
              <h2 className="text-xl font-semibold mb-1">
                Upload New Document
              </h2>
              <p className="text-gray-500 mb-6 text-sm">
                Add a PDF document to your library
              </p>
              <form onSubmit={handleUpload}>
                <div
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-8 mb-6 transition ${
                    selectedFile
                      ? "border-green-300 bg-green-50"
                      : "border-gray-200"
                  }`}
                >
                  <label
                    htmlFor="modal-file-upload"
                    className="flex flex-col items-center cursor-pointer"
                  >
                    <ArrowUpTrayIcon className="w-10 h-10 text-green-400 mb-2" />
                    {selectedFile ? (
                      <>
                        <span className="text-green-700 font-medium">
                          {selectedFile.name}
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PDF up to 10MB
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-gray-500 font-medium">
                          Click to select PDF file
                        </span>
                        <span className="text-xs text-gray-400 mt-1">
                          PDF up to 10MB
                        </span>
                      </>
                    )}
                    <input
                      id="modal-file-upload"
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                      required
                    />
                  </label>
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 bg-white hover:bg-gray-100 font-medium"
                    onClick={() => {
                      setShowModal(false);
                      setSelectedFile(null);
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    className="px-6 py-2 rounded-lg bg-green-500 cursor-pointer hover:bg-green-600 text-white font-semibold transition disabled:opacity-60"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
