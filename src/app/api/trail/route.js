import authentication from "@/models/authentication";
import trail from "@/models/trail";
import { NextResponse } from "next/server";

export async function GET(request) {
  const userId = await authentication.getUserId(request);

  const trailData = await trail.get(userId);

  return NextResponse.json(trailData);
}
