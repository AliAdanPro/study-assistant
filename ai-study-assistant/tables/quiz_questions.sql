CREATE TABLE quiz_questions (
  id SERIAL PRIMARY KEY,
  quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
  question TEXT,
  options TEXT[], -- Array of options
  correct_option INTEGER, -- Index of correct option
  user_answer INTEGER -- Index of user's answer
);