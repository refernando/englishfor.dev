import { NextResponse } from "next/server";
import authentication from "@/models/authentication";
import users from "@/models/users";
import achievements from "@/models/achievements";
import errors from "@/models/errors";

export async function POST(request) {
  const formData = await request.json();

  const { login, password } = formData;

  if (!login)
    return NextResponse.json(errors.format("Informe o login", "login"), {
      status: 400,
    });
  if (!password)
    return NextResponse.json(errors.format("Informe a senha", "password"), {
      status: 400,
    });

  const userId = await users.getIdByLoginAndPassword(login, password);

  if (userId) {
    // Verifica conquista "Veterano" (1 ano de membro) no login
    await achievements.checkVeterano(userId);

    const response = await authentication.create(
      userId,
      NextResponse.json({ success: true }),
    );

    return response;
  }

  return NextResponse.json({ success: false }, { status: 404 });
}
