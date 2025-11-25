import { NextResponse } from "next/server";
import authentication from "@/models/authentication";
import users from "@/models/users";
import errors from "@/models/errors";

export async function POST(request) {
  const formData = await request.json();

  const { search } = formData;

  if (!search || search.length > 128) return NextResponse.json(errors.format("Pesquisa inválida.", "username"), {status: 400});

  const data = await users.get(search);

  return NextResponse.json(data);
}
