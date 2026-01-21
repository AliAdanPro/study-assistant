CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  filename VARCHAR(255) NOT NULL,
  filesize INTEGER NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  summary TEXT,
  ai_metadata JSONB,
  filepath VARCHAR(255)
);
