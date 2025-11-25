import database from "@/infra/database";
import users from "./users";

async function get(userId) {
  const levels = await getLevels();
  const exercises = await getExercises();
  const userProgression = await users.getUserProgression(userId);

  const completedExercises = new Set(userProgression.map(row => row.exercise_id));

  const trail = levels.map(level => {
    return {
      ...level,
      exercises: exercises
        .filter(exercise => exercise.level_id === level.id)
        .map(exercise => ({
          ...exercise,
          completed: completedExercises.has(exercise.id)
        }))
    };
  });

  return trail;
}

async function getLevels() {
  const levels = await database.query("SELECT * FROM levels WHERE status = 'published' ORDER BY position;");

  return levels;
}

async function getExercises() {
  const exercises = await database.query("SELECT * FROM exercises WHERE status = 'published' ORDER BY position;");

  return exercises;
}

async function getExerciseById(id) {
  const exercises = await database.query("SELECT * FROM exercises WHERE id = $1 AND status = 'published' LIMIT 1;", [id]);

  if (exercises.length === 0) return null;

  const questions = await database.query("SELECT * FROM questions WHERE exercise_id = $1 AND status = 'published' ORDER BY position;", [id]);

  const exerciseData = {
    ...exercises[0],
    questions: questions,
  };

  return exerciseData;
}

export default {
  get,
  getLevels,
  getExercises,
  getExerciseById
};
