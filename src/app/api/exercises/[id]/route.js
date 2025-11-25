import errors from "@/models/errors";
import trail from "@/models/trail";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { id } = await params;

  const exercise = await trail.getExerciseById(id);

  if (!exercise) {
    return NextResponse.json(errors.format("Exercício não encontrado", "exercise"), { status: 404 });
  }

  return NextResponse.json(exercise);
}
