import database from "@/infra/database";
import { NextResponse } from "next/server";
import { createHash } from 'crypto';

export async function GET(request) {
  try {
    const allEvaluations = await database.query(`
      SELECT 
        user_id,
        question_id,
        grammar_score,
        coherence_score,
        tech_context_score,
        relevance_score,
        estimated_cefr,
        key_improvement_areas,
        vocabulary_tier,
        evaluated_at
      FROM 
        answer_evaluations
      ORDER BY
        user_id, evaluated_at DESC;
    `);


    // mapa de tradução que viverá apenas durante esta requisição
    const idTranslationMap = new Map();
    const salt = process.env.ANONYMIZATION_SALT || 'default-secret-salt';

    const anonymizedEvaluations = allEvaluations.map(evaluation => {
      const realUserId = evaluation.user_id;
      let anonymousId;

      if (idTranslationMap.has(realUserId)) {
        anonymousId = idTranslationMap.get(realUserId);
      } else {
        const randomSeed = Date.now().toString() + Math.random().toString();
        const dataToHash = realUserId.toString() + randomSeed + salt;
        const newAnonymousId = createHash('sha256').update(dataToHash).digest('hex').substring(0, 16);
  
        idTranslationMap.set(realUserId, newAnonymousId);
        anonymousId = newAnonymousId;
      }

      return {
        anonymous_user_id: anonymousId,
        question_id: evaluation.question_id,
        scores: {
          grammar: evaluation.grammar_score,
          coherence: evaluation.coherence_score,
          tech_context: evaluation.tech_context_score,
          relevance: evaluation.relevance_score,
        },
        estimated_cefr_level: evaluation.estimated_cefr,
        improvement_areas: evaluation.key_improvement_areas,
        vocabulary_tier: evaluation.vocabulary_tier,
        evaluated_at: evaluation.evaluated_at
      };
    });

    const headers = { 'Access-Control-Allow-Origin': '*' };
    return NextResponse.json({ evaluations: anonymizedEvaluations }, { headers });

  } catch (error)
  {
    console.error("Public API /evaluations/all Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}