CREATE TABLE flashcards (
  id SERIAL PRIMARY KEY,
  set_id INTEGER REFERENCES flashcard_sets(id) ON DELETE CASCADE,
  question TEXT,
  answer TEXT,
  difficulty VARCHAR(20) DEFAULT 'EASY'
);