import authentication from "@/models/authentication";
import errors from "@/models/errors";
import users from "@/models/users";
import database from "@/infra/database";
import { NextResponse } from "next/server";

export async function POST(request) {
  const userId = await authentication.getUserId(request);

  const generateCertificate = await users.generateCertificate(userId);

  if (generateCertificate) return NextResponse.json({ success: true, });

  return NextResponse.json({ success: false });
}
