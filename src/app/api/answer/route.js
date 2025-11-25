import ai from "@/infra/ai.js";
import database from "@/infra/database.js";
import authentication from "@/models/authentication.js";
import users from "@/models/users.js";
import achievements from "@/models/achievements.js";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const formData = await request.json();
    const { question, answer, usedVoice, questionId } = formData;

    // --- DEBUG ---
    const userId = await authentication.getUserId(request);
    console.log("DEBUG: ID do usuário obtido da autenticação:", userId);

    const user = await users.getById(userId);
    console.log("DEBUG: Objeto 'user' encontrado no banco:", user);
    // --------------------------------------------------------

    if (!user || !user.id) {
      console.error(
        "DEBUG: Usuário ou ID do usuário não encontrado. Abortando.",
      );
      return NextResponse.json(
        { error: "User not found or invalid" },
        { status: 404 },
      );
    }

    const evaluation = await ai.validateAnswer(question, answer, usedVoice);

    const insertQuery = `
      INSERT INTO answer_evaluations (
        user_id,
        question_id,
        answer_text,
        used_voice,
        grammar_score,
        coherence_score,
        tech_context_score,
        relevance_score,
        feedback_text,
        improved_sentence,
        estimated_cefr,
        key_improvement_areas,
        vocabulary_tier
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `;

    const values = [
      user.id,
      questionId,
      answer,
      usedVoice,
      evaluation.grammar,
      evaluation.coherence,
      evaluation.techContext,
      evaluation.relevance,
      evaluation.feedback,
      evaluation.improvedSentence,
      evaluation.estimatedCEFR,
      evaluation.keyImprovementAreas,
      evaluation.vocabularyTier,
    ];

    await database.query(insertQuery, values);

    // Verifica e concede conquistas relacionadas a responder perguntas
    // Inclui: Na Ponta da Língua (usar reconhecimento de voz)
    // e Perfeccionista (5 estrelas em todos os critérios de uma pergunta)
    const grantedAchievements = await achievements.checkOnAnswerSubmission(
      user.id,
      questionId,
      usedVoice,
    );

    return NextResponse.json({
      response: evaluation,
      achievements: grantedAchievements,
    });
  } catch (error) {
    console.error("Answer submission error:", error);
    return NextResponse.json(
      { error: "Failed to process answer" },
      { status: 500 },
    );
  }
}
