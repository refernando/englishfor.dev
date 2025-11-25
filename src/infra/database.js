import { neon } from "@neondatabase/serverless";

async function query(string, params = []) {
  const sql = neon(process.env.DATABASE_URL);
  const data = await sql(string, params);

  return data;
}

const databaseModelSQL = `
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY NOT NULL,
  email VARCHAR(254) NOT NULL,
  username VARCHAR(32) NOT NULL,
  name VARCHAR(128) NOT NULL,
  password VARCHAR(64) NOT NULL,
  features VARCHAR[],
  xp INT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('inactive', 'active', 'deleted')),
  created_at TIMESTAMP NOT NULL,
  updated_at TIMESTAMP NOT NULL
);
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(128) NOT NULL,
  position INT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'deleted'))
);
CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY NOT NULL,
  level_id INT NOT NULL,
  name VARCHAR(128) NOT NULL,
  description VARCHAR(256) NOT NULL,
  xp INT NOT NULL,
  position INT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'deleted')),
  FOREIGN KEY (level_id) REFERENCES levels(id)
);
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY NOT NULL,
  exercise_id INT NOT NULL,
  text VARCHAR(256) NOT NULL,
  position INT NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('draft', 'published', 'deleted')),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
CREATE TABLE IF NOT EXISTS user_progressions (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INT NOT NULL,
  exercise_id INT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (exercise_id) REFERENCES exercises(id)
);
CREATE TABLE IF NOT EXISTS achievements (
  id SERIAL PRIMARY KEY NOT NULL,
  name VARCHAR(64) NOT NULL,
  description VARCHAR(128) NOT NULL,
  badge VARCHAR(64) NOT NULL,
  status VARCHAR(20) NOT NULL CHECK (status IN ('unlisted', 'public', 'deleted'))
);
CREATE TABLE IF NOT EXISTS user_achievements (
  id SERIAL PRIMARY KEY NOT NULL,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  awarded_at TIMESTAMP NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (achievement_id) REFERENCES achievements(id)
);
CREATE TABLE IF NOT EXISTS answer_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INT NOT NULL,
  question_id INT NOT NULL,
  answer_text TEXT NOT NULL,
  used_voice BOOLEAN NOT NULL DEFAULT FALSE,
  grammar_score INT NOT NULL,
  coherence_score INT NOT NULL,
  tech_context_score INT NOT NULL,
  relevance_score INT NOT NULL,
  feedback_text TEXT,
  improved_sentence TEXT,
  estimated_cefr VARCHAR(4),
  key_improvement_areas VARCHAR[],
  vocabulary_tier VARCHAR(20),
  evaluated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (question_id) REFERENCES questions(id)
);
`;

const databaseDataModelSQL = `
INSERT INTO users (email, username, name, password, features, xp, status, created_at, updated_at) VALUES
('admin@admin.com', 'admin', 'Administrador', encode(digest('englishfordev', 'sha256'), 'hex'), ARRAY['admin', 'certificate'], 0, 'active', NOW(), NOW()),
('user@user.com', 'user', 'Usuário', encode(digest('englishfordev', 'sha256'), 'hex'), ARRAY[]::VARCHAR[], 0, 'active', NOW(), NOW());

INSERT INTO levels (name, position, status) VALUES
('💼 Job interview', 10, 'published'),
('🤝 You are hired', 20, 'published'),
('👥 Working in the team', 30, 'published'),
('🚀 Career development', 40, 'published');

INSERT INTO exercises (level_id, name, description, xp, position, status) VALUES
(1, 'Personal knowledge interview', 'You applied for an IT job and in your first interview they want to get to know you better.', 15, 10, 'published'),
(1, 'Situational interview', 'Now, they want to know how you would behave in certain situations.', 20, 20, 'published'),
(1, 'Interview with the manager', 'Final step to determine your approval, focused on IT questions.', 25, 30, 'published'),
(2, 'Your first day', 'Welcome and introduction on your first day at the company.', 15, 10, 'published'),
(2, 'Getting to know the team', 'Understand your role and interaction with your new team.', 15, 20, 'published'),
(3, 'Daily work life', 'Questions about your daily tasks and priorities.', 15, 10, 'published'),
(3, 'Collaboration and communication', 'Focus on teamwork, feedback and communication.', 20, 20, 'published'),
(3, 'Meetings and presentations', 'How to handle meetings and presentations effectively.', 20, 30, 'published'),
(4, 'Continuous learning', 'Discuss your approach to lifelong learning and skill improvement.', 20, 10, 'published'),
(4, 'Goal setting and motivation', 'How you set professional goals and keep motivated.', 15, 20, 'published'),
(4, 'Networking and relationship building', 'Your strategy to build and maintain professional relationships.', 20, 30, 'published');

INSERT INTO questions (exercise_id, text, position, status) VALUES
(1, 'Can you please tell me a bit about yourself?', 10, 'published'),
(1, 'What is your hobby?', 20, 'published'),
(1, 'Please tell me about some of your strengths and weaknesses.', 30, 'published'),
(1, 'What are your career goals for the next five years?', 40, 'published'),
(1, 'How did you overcome the biggest challenge of your life?', 50, 'published'),
(2, 'You have a demand for tomorrow, a colleague asks you for help with another demand, what would you do in this case?', 10, 'published'),
(2, 'Imagine you made a mistake. How did you communicate that mistake?', 20, 'published'),
(2, 'Imagine a situation that you disagreed with someone at work. What would you do?', 30, 'published'),
(2, 'You have two meetings scheduled at the same time, how would you handle this?', 40, 'published'),
(3, 'How do you stay up to date on the latest technology required for a career in IT?', 10, 'published'),
(3, 'What programming languages do you know and how did you learn them?', 20, 'published'),
(3, 'Do you consider yourself proactive, and why?', 30, 'published'),
(3, 'A new update for your software is failing to install. Please explain how you would troubleshoot it.', 40, 'published'),
(3, 'How do you use AI in your work?', 50, 'published'),
(4, 'Hello! Welcome to the team. Let me show you around. Do you have any questions?', 10, 'published'),
(4, 'This is your workspace. Do you prefer a standing desk or sitting?', 20, 'published'),
(4, 'Would you like a cup of coffee or tea before we start?', 30, 'published'),
(4, 'Here is the schedule for the week. We have a team meeting on Monday at 10 AM.', 40, 'published'),
(4, 'If you need any help, just ask me or your team members.', 50, 'published'),
(5, 'Can you tell me about your role in the team?', 10, 'published'),
(5, 'What projects are you currently working on?', 20, 'published'),
(5, 'How do you usually communicate with your team?', 30, 'published'),
(5, 'What is your favorite programming language and why?', 40, 'published'),
(5, 'What do you like to do outside of work?', 50, 'published'),
(6, 'How do you usually start your workday?', 10, 'published'),
(6, 'What do you do if you don''t understand a task assigned to you?', 20, 'published'),
(6, 'How do you prioritize your work when there are many tasks?', 30, 'published'),
(6, 'How do you communicate progress on your tasks to your manager or team?', 40, 'published'),
(6, 'What do you do when you finish your tasks early?', 50, 'published'),
(7, 'How do you handle disagreements with a teammate during a project?', 10, 'published'),
(7, 'What is your preferred way to share ideas in a team meeting?', 20, 'published'),
(7, 'How do you give constructive feedback to a colleague?', 30, 'published'),
(7, 'Describe a time when you helped a teammate solve a problem.', 40, 'published'),
(7, 'How do you ask for help when you''re stuck on a technical issue?', 50, 'published'),
(8, 'How do you prepare for a team meeting?', 10, 'published'),
(8, 'What do you do if you don''t understand something during a meeting?', 20, 'published'),
(8, 'How do you share your ideas clearly in a presentation?', 30, 'published'),
(8, 'How do you handle questions during or after your presentation?', 40, 'published'),
(8, 'What is important to remember when attending a remote meeting?', 50, 'published'),
(9, 'How do you stay current with industry trends and technologies?', 10, 'published'),
(9, 'Can you describe a recent skill you learned and how you applied it?', 20, 'published'),
(9, 'What resources do you use for your professional development?', 30, 'published'),
(10, 'How do you set your short-term and long-term career goals?', 10, 'published'),
(10, 'What motivates you to keep improving professionally?', 20, 'published'),
(10, 'How do you handle setbacks when working towards your goals?', 30, 'published'),
(11, 'How do you approach networking in your industry?', 10, 'published'),
(11, 'Can you share an experience where networking helped you professionally?', 20, 'published'),
(11, 'What strategies do you use to maintain long-term professional relationships?', 30, 'published');

INSERT INTO user_progressions (user_id, exercise_id) VALUES
(1, 1);

INSERT INTO achievements (name, description, badge, status) VALUES
('Determinado', 'Complete 5 exercícios', 'GraphIcon', 'public'),
('Ofensivo', 'Complete 10 exercícios', 'FlameIcon', 'public'),
('Aprendiz', 'Atinja 50 de XP', 'RocketIcon', 'public'),
('Experiente', 'Atinja 100 de XP', 'TrophyIcon', 'public'),
('Na Ponta da Língua', 'Use o reconhecimento de fala para responder uma pergunta', 'SmileyIcon', 'public'),
('Perfeccionista', 'Consiga 5 estrelas em todos os critérios de uma perguta', 'NorthStarIcon', 'public'),
('Star Streak', 'Consiga 5 estrelas em todas as perguntas de um exercício', 'StarIcon', 'public'),
('Esforçado', 'Complete o mesmo exercício novamente', 'ThumbsupIcon', 'public'),
('The End', 'Complete todos os exercícios', 'FileBadgeIcon', 'public'),
('Veterano', 'Seja membro da plataforma por 1 ano', 'HeartIcon', 'public');

INSERT INTO user_achievements(user_id, achievement_id, awarded_at) VALUES
(1, 1, NOW());

`;

const databaseDropSQL = `
DROP TABLE IF EXISTS user_achievements;
DROP TABLE IF EXISTS achievements;
DROP TABLE IF EXISTS user_progressions;
DROP TABLE IF EXISTS answer_evaluations;
DROP TABLE IF EXISTS questions;
DROP TABLE IF EXISTS exercises;
DROP TABLE IF EXISTS levels;
DROP TABLE IF EXISTS users;
`;

export default {
  query,
  databaseModelSQL,
  databaseDataModelSQL,
  databaseDropSQL
};
