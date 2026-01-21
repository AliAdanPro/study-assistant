CREATE TABLE flashcard_sets (
  id SERIAL PRIMARY KEY,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW()
);