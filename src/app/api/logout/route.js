import authentication from "@/models/authentication";
import { NextResponse } from "next/server";

export async function GET() {
  const response = await authentication.destroy(new NextResponse(null));
  return response;
}
