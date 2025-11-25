import { NextResponse } from "next/server";
import database from "@/infra/database.js";
import authentication from "@/models/authentication.js";
import users from "@/models/users.js";

export async function GET(request) {
  try {
    const userId = await authentication.getUserId(request);
    const authenticatedUser = await users.getById(userId);

    if (!authenticatedUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const evaluationsResult = await database.query(
      `SELECT * FROM answer_evaluations WHERE user_id = $1 ORDER BY evaluated_at ASC`,
      [authenticatedUser.id]
    );

    const evaluations = evaluationsResult;
    const totalAnswers = evaluations.length;

    if (totalAnswers === 0) {
      return NextResponse.json({
        skillAverages: [], improvementPercentages: [], progressOverTime: [], vocabularyDistribution: []
      });
    }

    // DADOS PARA O GRÁFICO DE RADAR
    const totalScores = { grammar: 0, coherence: 0, techContext: 0, relevance: 0 };
    evaluations.forEach(ev => {
      totalScores.grammar += ev.grammar_score;
      totalScores.coherence += ev.coherence_score;
      totalScores.techContext += ev.tech_context_score;
      totalScores.relevance += ev.relevance_score;
    });
    const skillAverages = [
      { subject: 'Gramática', score: parseFloat((totalScores.grammar / totalAnswers).toFixed(2)), fullMark: 5 },
      { subject: 'Coerência', score: parseFloat((totalScores.coherence / totalAnswers).toFixed(2)), fullMark: 5 },
      { subject: 'Contexto Téc.', score: parseFloat((totalScores.techContext / totalAnswers).toFixed(2)), fullMark: 5 },
      { subject: 'Relevância', score: parseFloat((totalScores.relevance / totalAnswers).toFixed(2)), fullMark: 5 },
    ];

    // DADOS PARA O GRÁFICO DE BARRAS
    const improvementCounts = {};
    evaluations.forEach(ev => {
      ev.key_improvement_areas.forEach(area => {
        improvementCounts[area] = (improvementCounts[area] || 0) + 1;
      });
    });
    const improvementPercentages = Object.entries(improvementCounts)
      .map(([name, count]) => ({ 
        name, 
        percentage: parseFloat(((count / totalAnswers) * 100).toFixed(1)) 
      }))
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);

    // DADOS PARA O GRÁFICO DE LINHA
    const progressOverTime = evaluations.map(ev => ({
      date: new Date(ev.evaluated_at).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
      averageScore: parseFloat(((ev.grammar_score + ev.coherence_score + ev.tech_context_score + ev.relevance_score) / 4).toFixed(2))
    }));

    // DADOS PARA O GRÁFICO DE PIZZA
    const vocabCounts = {};
    evaluations.forEach(ev => {
        vocabCounts[ev.vocabulary_tier] = (vocabCounts[ev.vocabulary_tier] || 0) + 1;
    });
    const vocabularyDistribution = Object.entries(vocabCounts)
        .map(([name, value]) => ({ name, value }));

    return NextResponse.json({ skillAverages, improvementPercentages, progressOverTime, vocabularyDistribution });

  } catch (error) {
    console.error("API Stats Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}