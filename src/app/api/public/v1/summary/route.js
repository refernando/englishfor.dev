import database from "@/infra/database";
import { NextResponse } from "next/server";

export async function GET(request) {
  try {
    // média geral de todas as notas e contagem total
    const overviewQuery = `
      SELECT 
        AVG(grammar_score) as average_grammar,
        AVG(coherence_score) as average_coherence,
        AVG(tech_context_score) as average_tech_context,
        AVG(relevance_score) as average_relevance,
        COUNT(*) as total_answers
      FROM answer_evaluations;
    `;
    const overviewResult = (await database.query(overviewQuery))[0];

    // todos os erros
    const allMistakesQuery = `
      SELECT
        UNNEST(key_improvement_areas) as mistake,
        COUNT(*) as occurrences
      FROM 
        answer_evaluations
      GROUP BY mistake ORDER BY occurrences DESC;
    `;
    const allMistakes = await database.query(allMistakesQuery);

    // contar a distribuição de vocabulário
    const vocabularyQuery = `
      SELECT
        vocabulary_tier as tier,
        COUNT(*) as occurrences
      FROM
        answer_evaluations
      GROUP BY tier ORDER BY occurrences DESC;
    `;
    const vocabularyDistribution = await database.query(vocabularyQuery);

    const summary = {
      platform_activity: {
        total_answers_evaluated: parseInt(overviewResult.total_answers, 10)
      },
      overall_performance_averages: {
        grammar: parseFloat(overviewResult.average_grammar).toFixed(2),
        coherence: parseFloat(overviewResult.average_coherence).toFixed(2),
        tech_context: parseFloat(overviewResult.average_tech_context).toFixed(2),
        relevance: parseFloat(overviewResult.average_relevance).toFixed(2),
      },
      vocabulary_distribution: vocabularyDistribution,
      all_improvement_areas: allMistakes
    };

    const headers = { 'Access-Control-Allow-Origin': '*' };
    return NextResponse.json(summary, { headers });

  } catch (error) {
    console.error("Public API /summary Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}