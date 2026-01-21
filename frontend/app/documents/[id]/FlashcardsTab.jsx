"use client";
import React, { useState } from "react";
import FlashcardSetList from "./FlashcardSetList";
import FlashcardReview from "./FlashcardReview";

export default function FlashcardsTab({ documentId }) {
  const [selectedSet, setSelectedSet] = useState(null);
  return selectedSet ? (
    <FlashcardReview setId={selectedSet} onBack={() => setSelectedSet(null)} />
  ) : (
    <FlashcardSetList documentId={documentId} onSelectSet={setSelectedSet} />
  );
}
