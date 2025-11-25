import database from "@/infra/database";
import users from "./users";
import trail from "./trail";

/**
 * IDs das conquistas no banco de dados
 * Baseados na ordem de inserção no databaseDataModelSQL
 */
const ACHIEVEMENT_IDS = {
  DETERMINADO: 1, // Complete 5 exercícios
  OFENSIVO: 2, // Complete 10 exercícios
  APRENDIZ: 3, // Atinja 50 de XP
  EXPERIENTE: 4, // Atinja 100 de XP
  NA_PONTA_DA_LINGUA: 5, // Use o reconhecimento de fala
  PERFECCIONISTA: 6, // Consiga 5 estrelas em todos os critérios de uma pergunta
  STAR_STREAK: 7, // Consiga 5 estrelas em todas as perguntas de um exercício
  ESFORCADO: 8, // Complete o mesmo exercício novamente
  THE_END: 9, // Complete todos os exercícios
  VETERANO: 10, // Seja membro da plataforma por 1 ano
};

/**
 * Verifica e concede a conquista "Determinado" (Complete 5 exercícios)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkDeterminado(userId) {
  const progressions = await users.getUserProgression(userId);

  // Verifica se o usuário completou pelo menos 5 exercícios
  if (progressions.length >= 5) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.DETERMINADO);
  }

  return false;
}

/**
 * Verifica e concede a conquista "Ofensivo" (Complete 10 exercícios)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkOfensivo(userId) {
  const progressions = await users.getUserProgression(userId);

  // Verifica se o usuário completou pelo menos 10 exercícios
  if (progressions.length >= 10) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.OFENSIVO);
  }

  return false;
}

/**
 * Verifica e concede a conquista "Aprendiz" (Atinja 50 de XP)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkAprendiz(userId) {
  const user = await users.getById(userId);

  // Verifica se o usuário atingiu pelo menos 50 de XP
  if (user && user.xp >= 50) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.APRENDIZ);
  }

  return false;
}

/**
 * Verifica e concede a conquista "Experiente" (Atinja 100 de XP)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkExperiente(userId) {
  const user = await users.getById(userId);

  // Verifica se o usuário atingiu pelo menos 100 de XP
  if (user && user.xp >= 100) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.EXPERIENTE);
  }

  return false;
}

/**
 * Verifica e concede a conquista "Na Ponta da Língua" (Use o reconhecimento de fala)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkNaPontaDaLingua(userId) {
  // Verifica se o usuário usou reconhecimento de fala em alguma resposta
  const voiceAnswers = await database.query(
    "SELECT id FROM answer_evaluations WHERE user_id = $1 AND used_voice = true LIMIT 1;",
    [userId],
  );

  if (voiceAnswers.length > 0) {
    return await users.createAchievement(
      userId,
      ACHIEVEMENT_IDS.NA_PONTA_DA_LINGUA,
    );
  }

  return false;
}

/**
 * Verifica e concede a conquista "Perfeccionista" (Consiga 5 estrelas em todos os critérios)
 * @param {number} userId - ID do usuário
 * @param {number} questionId - ID da pergunta respondida
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkPerfeccionista(userId, questionId) {
  // Busca a resposta mais recente para esta pergunta
  const answer = await database.query(
    `SELECT grammar_score, coherence_score, tech_context_score, relevance_score
     FROM answer_evaluations
     WHERE user_id = $1 AND question_id = $2
     ORDER BY evaluated_at DESC
     LIMIT 1;`,
    [userId, questionId],
  );

  // Verifica se todos os critérios receberam nota 5
  if (answer.length > 0) {
    const scores = answer[0];
    if (
      scores.grammar_score === 5 &&
      scores.coherence_score === 5 &&
      scores.tech_context_score === 5 &&
      scores.relevance_score === 5
    ) {
      return await users.createAchievement(
        userId,
        ACHIEVEMENT_IDS.PERFECCIONISTA,
      );
    }
  }

  return false;
}

/**
 * Verifica e concede a conquista "Star Streak" (5 estrelas em todas as perguntas de um exercício)
 * @param {number} userId - ID do usuário
 * @param {number} exerciseId - ID do exercício
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkStarStreak(userId, exerciseId) {
  // Busca todas as perguntas do exercício
  const questions = await database.query(
    "SELECT id FROM questions WHERE exercise_id = $1 AND status = 'published';",
    [exerciseId],
  );

  if (questions.length === 0) return false;

  // Para cada pergunta, verifica se há uma resposta com todas as notas 5
  let allPerfect = true;

  for (const question of questions) {
    const answer = await database.query(
      `SELECT grammar_score, coherence_score, tech_context_score, relevance_score
       FROM answer_evaluations
       WHERE user_id = $1 AND question_id = $2
       ORDER BY evaluated_at DESC
       LIMIT 1;`,
      [userId, question.id],
    );

    if (answer.length === 0) {
      allPerfect = false;
      break;
    }

    const scores = answer[0];
    if (
      scores.grammar_score !== 5 ||
      scores.coherence_score !== 5 ||
      scores.tech_context_score !== 5 ||
      scores.relevance_score !== 5
    ) {
      allPerfect = false;
      break;
    }
  }

  // Se todas as perguntas têm notas perfeitas, concede a conquista
  if (allPerfect) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.STAR_STREAK);
  }

  return false;
}

/**
 * Verifica e concede a conquista "Esforçado" (Complete o mesmo exercício novamente)
 * Nota: Esta conquista só pode ser verificada quando um exercício já completado é tentado novamente
 * @param {number} userId - ID do usuário
 * @param {number} exerciseId - ID do exercício
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkEsforcado(userId, exerciseId) {
  // Verifica se o exercício já foi completado antes
  const progression = await database.query(
    "SELECT COUNT(*) as count FROM user_progressions WHERE user_id = $1 AND exercise_id = $2;",
    [userId, exerciseId],
  );

  // Se o exercício já foi completado e o usuário está tentando novamente
  if (progression.length > 0 && parseInt(progression[0].count) > 0) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.ESFORCADO);
  }

  return false;
}

/**
 * Verifica e concede a conquista "The End" (Complete todos os exercícios)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkTheEnd(userId) {
  // Busca todos os exercícios publicados
  const allExercises = await trail.getExercises();
  const userProgressions = await users.getUserProgression(userId);

  // Verifica se o usuário completou todos os exercícios
  if (
    allExercises.length > 0 &&
    userProgressions.length >= allExercises.length
  ) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.THE_END);
  }

  return false;
}

/**
 * Verifica e concede a conquista "Veterano" (Seja membro da plataforma por 1 ano)
 * @param {number} userId - ID do usuário
 * @returns {Promise<boolean>} - true se a conquista foi concedida, false caso contrário
 */
async function checkVeterano(userId) {
  const user = await users.getById(userId);

  if (!user) return false;

  // Calcula a diferença entre a data atual e a data de criação da conta
  const createdAt = new Date(user.created_at);
  const now = new Date();
  const oneYearInMs = 365 * 24 * 60 * 60 * 1000;

  // Verifica se passou pelo menos 1 ano
  if (now - createdAt >= oneYearInMs) {
    return await users.createAchievement(userId, ACHIEVEMENT_IDS.VETERANO);
  }

  return false;
}

/**
 * Verifica todas as conquistas relacionadas à conclusão de exercícios
 * Deve ser chamada quando um usuário completa um exercício
 * @param {number} userId - ID do usuário
 * @param {number} exerciseId - ID do exercício completado
 * @returns {Promise<Array>} - Array com as conquistas concedidas
 */
async function checkOnExerciseCompletion(userId, exerciseId) {
  const granted = [];

  // Nota: "Esforçado" deve ser verificado ANTES de criar a progressão
  // e não aqui, pois neste ponto o exercício já foi inserido no banco

  // Verifica conquistas de quantidade de exercícios
  if (await checkDeterminado(userId)) {
    granted.push("Determinado");
  }

  if (await checkOfensivo(userId)) {
    granted.push("Ofensivo");
  }

  // Verifica se completou todos os exercícios
  if (await checkTheEnd(userId)) {
    granted.push("The End");
  }

  // Verifica conquistas de XP (já que completar exercício dá XP)
  if (await checkAprendiz(userId)) {
    granted.push("Aprendiz");
  }

  if (await checkExperiente(userId)) {
    granted.push("Experiente");
  }

  // Verifica conquista "Star Streak" (5 estrelas em todas as perguntas)
  if (await checkStarStreak(userId, exerciseId)) {
    granted.push("Star Streak");
  }

  return granted;
}

/**
 * Verifica todas as conquistas relacionadas a responder perguntas
 * Deve ser chamada quando um usuário responde uma pergunta
 * @param {number} userId - ID do usuário
 * @param {number} questionId - ID da pergunta respondida
 * @param {boolean} usedVoice - Se usou reconhecimento de voz
 * @returns {Promise<Array>} - Array com as conquistas concedidas
 */
async function checkOnAnswerSubmission(userId, questionId, usedVoice) {
  const granted = [];

  // Verifica conquista "Na Ponta da Língua" (usar voz)
  if (usedVoice && (await checkNaPontaDaLingua(userId))) {
    granted.push("Na Ponta da Língua");
  }

  // Verifica conquista "Perfeccionista" (5 estrelas em todos os critérios)
  if (await checkPerfeccionista(userId, questionId)) {
    granted.push("Perfeccionista");
  }

  return granted;
}

export default {
  ACHIEVEMENT_IDS,
  checkDeterminado,
  checkOfensivo,
  checkAprendiz,
  checkExperiente,
  checkNaPontaDaLingua,
  checkPerfeccionista,
  checkStarStreak,
  checkEsforcado,
  checkTheEnd,
  checkVeterano,
  checkOnExerciseCompletion,
  checkOnAnswerSubmission,
};
