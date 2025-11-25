import database from "@/infra/database";

async function get(search) {
  const data = await database.query(
    `SELECT username, name FROM users
WHERE status = 'active'
  AND (name ILIKE '%' || $1 || '%' OR username ILIKE '%' || $1 || '%')
LIMIT 10;`,
    [search]
  );

  if (data.length === 0) return null;

  return data;
}

async function getById(id) {
  const data = await database.query(
    `SELECT id, email, username, name, features, xp, status, created_at, updated_at FROM users WHERE id = $1`,
    [id]
  );

  if (data.length === 0) return null;

  return data[0];
}

async function getByUsername(username) {
  const data = await database.query("SELECT id, username, name, features, xp, created_at FROM users WHERE LOWER(username) = $1 AND status = 'active' LIMIT 1;", [username.toLowerCase()]);

  if (data.length === 0) return null;

  const achievements = await database.query(`SELECT * FROM achievements WHERE status = 'public';`);
  const awards = await database.query('SELECT * FROM user_achievements WHERE user_id = $1;', [data[0].id]);

  const userAchievements = achievements.map(achievement => {
      const userAchievement = awards.find(award => award.achievement_id === achievement.id);
      return {
        ...achievement,
        awarded: !!userAchievement,
        awarded_at: userAchievement ? userAchievement.awarded_at : null,
      };
    }
  );

  const userObject = {
    ...data[0],
    achievements: userAchievements,
  }

  return userObject;
}

async function getIdByLoginAndPassword(login, password) {
  password = password + "";

  const data = await database.query(
    `SELECT id FROM users WHERE (LOWER(username) = $1 OR email = $1) AND password = encode(digest($2, 'sha256'), 'hex');`,
    [login.toLowerCase(), password]
  );

  if (data.length === 0) return null;

  return data[0].id;
}

async function getUserProgression(userId) {
  const data = await database.query("SELECT exercise_id FROM user_progressions WHERE user_id = $1;", [userId]);

  if (data.length === 0) return [];

  return data;
}

async function exists(username, email) {
  const data = await database.query(
    `SELECT LOWER(username) AS username, email FROM users WHERE LOWER(username) = $1 OR email = $2;`,
    [username.toLowerCase(), email.toLowerCase()]
  );

  if (data.length === 0) return null;

  return {
    email: data.some(u => u.email === email.toLowerCase()),
    username: data.some(u => u.username === username.toLowerCase())
  };
}

async function create(email, username, name, password) {
  password = password + "";

  const data = await database.query(
    `INSERT INTO users (email, username, name, password, features, xp, status, created_at, updated_at) VALUES
($1, $2, $3, encode(digest($4, 'sha256'), 'hex'), ARRAY[]::VARCHAR[], 0, 'active', NOW(), NOW()) RETURNING id;`,
    [email.toLowerCase().trim(), username.trim(), name.trim(), password]
  );

  if (data.length === 0) return null;

  return data[0];
}

async function createProgression(userId, exerciseId) {
  const progression = await database.query('SELECT * FROM user_progressions WHERE user_id = $1 AND exercise_id = $2;', [userId, exerciseId]);
  if (progression.length > 0) return false;

  const exercise = await database.query('SELECT xp FROM exercises WHERE id = $1;', [exerciseId]);
  if (exercise.length === 0) return null;

  await database.query('INSERT INTO user_progressions (user_id, exercise_id) VALUES($1, $2)', [userId, exerciseId]);
  await database.query('UPDATE users SET xp = xp + $1 WHERE id = $2', [exercise[0].xp, userId]);

  return true;
}

async function createAchievement(userId, achievementId) {
  const achievement = await database.query('SELECT * FROM user_achievements WHERE user_id = $1 AND achievement_id = $2;', [userId, achievementId]);
  if (achievement.length > 0) return false;

  await database.query('INSERT INTO user_achievements(user_id, achievement_id, awarded_at) VALUES ($1, $2, NOW())', [userId, achievementId]);

  return true;
}

async function update(userId, email, username, name, password) {
  let data = [];

  if (!password) {
    data = await database.query(
      `UPDATE users SET email = $1, username = $2, name = $3, updated_at = NOW() WHERE id = $4 RETURNING id;`,
      [email.toLowerCase().trim(), username.trim(), name.trim(), userId]
    );
  } else {
    password = password + "";

    data = await database.query(
      `UPDATE users SET email = $1, username = $2, name = $3, password = encode(digest($4, 'sha256'), 'hex'), updated_at = NOW() WHERE id = $5 RETURNING id;`,
      [email.toLowerCase().trim(), username.trim(), name.trim(), password, userId]
    );
  }

  if (data.length === 0) return null;

  return data[0];
}

async function canGenerateCertificate(userId, addFeature = false) {
  const exercises = await database.query(
    "SELECT id FROM exercises WHERE status = 'published'"
  );

  const completedExercises = await database.query(
    "SELECT exercise_id FROM user_progressions WHERE user_id = $1",
    [userId]
  );

  const completedExerciseIds = completedExercises.map((row) => row.exercise_id);
  const allCompleted = exercises.every((exercise) =>
    completedExerciseIds.includes(exercise.id)
  );

  const hasCertificate = await database.query(
    "SELECT id FROM users WHERE array_position(features, 'certificate') IS NOT NULL AND id = $1;",
    [userId]
  );

  if (allCompleted && !hasCertificate.length) {
    if (addFeature) await database.query(`UPDATE users SET features = array_append(features, 'redeem:certificate') WHERE id = $1`, [userId]); //TODO: caso seja adicionado novos exercícios isso quebra

    return true;
  }

  return false;
}

async function generateCertificate(userId) {
  if (canGenerateCertificate(userId)) {
    await database.query(`UPDATE users SET features = array_remove(features, 'redeem:certificate') WHERE id = $1`, [userId]);
    await database.query(`UPDATE users SET features = array_append(features, 'certificate') WHERE id = $1`, [userId]);

    return true;
  }

  return false;
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validateUsername(username) {
  const usernameRegex = /^[A-Za-z0-9_.]+$/;
  return usernameRegex.test(username);
}

function validateName(name) {
  const nameRegex = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/;
  return nameRegex.test(name);
}

const USER_ACHIEVEMENTS = {
  OFFENSIVE: 1,
  EXPERIENCED: 2,
  USE_VOICE: 3,
  ONE_YEAR: 4,
}

export default {
  get,
  getById,
  getByUsername,
  getIdByLoginAndPassword,
  getUserProgression,
  exists,
  create,
  createProgression,
  createAchievement,
  update,
  canGenerateCertificate,
  generateCertificate,
  validateEmail,
  validateUsername,
  validateName,
  USER_ACHIEVEMENTS,
};
