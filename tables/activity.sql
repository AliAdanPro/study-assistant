CREATE TABLE activity (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  type VARCHAR(32) NOT NULL,
  document_id INTEGER REFERENCES documents(id) ON DELETE CASCADE,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT NOW(),
  duration_minutes INTEGER DEFAULT 0
);