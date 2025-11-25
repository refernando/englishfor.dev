import errors from "@/models/errors";
import users from "@/models/users";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  const { username } = await params;

  const user = await users.getByUsername(username);

  if (!user) {
    return NextResponse.json(errors.format("Usuário não encontrado", "user"), { status: 404 });
  }

  if (!user.achievements.includes(users.USER_ACHIEVEMENTS.ONE_YEAR)) {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);

    if (new Date(user.created_at) < oneYearAgo) {
      await users.createAchievement(user.id, users.USER_ACHIEVEMENTS.ONE_YEAR);
    }
  }

  delete user.id;

  // user.features.push('redeem:certificate')

  return NextResponse.json(user);
}
