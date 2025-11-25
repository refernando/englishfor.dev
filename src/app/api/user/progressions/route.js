import authentication from "@/models/authentication";
import errors from "@/models/errors";
import users from "@/models/users";
import achievements from "@/models/achievements";
import { NextResponse } from "next/server";

export async function POST(request) {
  const userId = await authentication.getUserId(request);
  const formData = await request.json();

  // Verifica conquista "Esforçado" ANTES de criar a progressão
  // (precisa verificar se o exercício já foi completado anteriormente)
  const alreadyCompleted = await achievements.checkEsforcado(
    userId,
    formData.exercise_id,
  );

  const progression = await users.createProgression(
    userId,
    formData.exercise_id,
  );
  if (progression == false) {
    return NextResponse.json(
      errors.format("Nível já completado", "progression"),
      { status: 400 },
    );
  }
  if (progression == null) {
    return NextResponse.json(
      errors.format("Exercício não encontrado", "exercise"),
      { status: 404 },
    );
  }

  // Verifica se o usuário pode gerar certificado
  await users.canGenerateCertificate(userId, true);

  // Verifica e concede conquistas relacionadas à conclusão de exercícios
  // Inclui: Determinado (5 exercícios), Ofensivo (10 exercícios),
  // The End (todos exercícios), Star Streak (5 estrelas em todas perguntas),
  // Aprendiz (50 XP), Experiente (100 XP)
  const grantedAchievements = await achievements.checkOnExerciseCompletion(
    userId,
    formData.exercise_id,
  );

  // Adiciona "Esforçado" se foi concedida antes da progressão
  if (alreadyCompleted) {
    grantedAchievements.push("Esforçado");
  }

  return NextResponse.json({
    success: true,
    achievements: grantedAchievements,
  });
}
