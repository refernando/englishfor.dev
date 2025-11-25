import { NextResponse } from "next/server";
import authentication from "@/models/authentication";
import users from "@/models/users";
import errors from "@/models/errors";

export async function POST(request) {
  const formData = await request.json();

  const { username, email, name, password } = formData;

  if (!username || username.length > 32) return NextResponse.json(errors.format("Usuário inválido", "username"), {status: 400});
  if (!name || name.length > 128) return NextResponse.json(errors.format("Nome inválido", "name"), {status: 400});
  if (!email || email.length > 254) return NextResponse.json(errors.format("E-mail inválido", "email"), {status: 400});
  if (!password) return NextResponse.json(errors.format("Senha inválida", "password"), {status: 400});

  if (!users.validateUsername(username)) return NextResponse.json(errors.format("Usuário inválido", "username"), {status: 400});
  if (!users.validateName(name)) return NextResponse.json(errors.format("Nome inválido", "name"), {status: 400});
  if (!users.validateEmail(email)) return NextResponse.json(errors.format("E-mail inválido", "email"), {status: 400});

  const userExists = await users.exists(username, email);

  if (userExists) {
    if (userExists.username) return NextResponse.json(errors.format("Esse usuário já está sendo usado por outra pessoa", "username"), { status: 409 });
    if (userExists.email) return NextResponse.json(errors.format("Esse e-mail já está sendo usado por outra pessoa", "email"), { status: 409 });
  }

  const data = await users.create(email, username, name, password);

  if (data) {
    const response = await authentication.create(
      data.id,
      NextResponse.json({ success: true })
    );

    return response;
  }

  return new NextResponse(null, { status: 500 });
}
