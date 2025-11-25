import { NextResponse, userAgent } from "next/server";
import authentication from "@/models/authentication";
import users from "@/models/users";
import errors from "@/models/errors";

export async function GET(request) {
  const userId = await authentication.getUserId(request);

  const user = await users.getById(userId);

  if (!user) return NextResponse.json({}, { status: 404 });

  const { browser } = userAgent(request);

  if (browser.name === "Chrome") user.features.push("use:microphone");

  return NextResponse.json(user);
}

export async function POST(request) {
  const formData = await request.json();

  const { username, email, name, password } = formData;

  const userId = await authentication.getUserId(request);

  const user = await users.getById(userId);

  if (!user) NextResponse.json({}, { status: 404 });

  if (!username || username.length > 32) return NextResponse.json(errors.format("Usuário inválido", "username"), {status: 400});
  if (!name || name.length > 128) return NextResponse.json(errors.format("Nome inválido", "name"), {status: 400});
  if (!email || email.length > 254) return NextResponse.json(errors.format("E-mail inválido", "email"), {status: 400});

  if (!users.validateUsername(username)) return NextResponse.json(errors.format("Usuário inválido", "username"), {status: 400});
  if (!users.validateName(name)) return NextResponse.json(errors.format("Nome inválido", "name"), {status: 400});
  if (!users.validateEmail(email)) return NextResponse.json(errors.format("E-mail inválido", "email"), {status: 400});

  const userExists = await users.exists(username, email);
  if (userExists) {
    if (userExists.username && username !== user.username) return NextResponse.json(errors.format("Esse usuário já está sendo usado por outra pessoa", "username"), { status: 409 });
    if (userExists.email && email !== user.email) return NextResponse.json(errors.format("Esse e-mail já está sendo usado por outra pessoa", "email"), { status: 409 });
  }

  const data = await users.update(userId, email, username, name, password);

  if (data) {
    return NextResponse.json({ success: true });
  }

  return new NextResponse(null, { status: 500 });
}

