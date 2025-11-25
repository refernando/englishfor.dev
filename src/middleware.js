import { NextResponse } from "next/server";
import authentication from "./models/authentication";

const protectedExactRoutes = [
  "/practice",
  "/settings",
  "/api/user",
  "/api/trail",
  "/api/answer",
  "/api/trail",
  "/api/db",
];

const protectedPrefixRoutes = [
  "/exercises",
  "/users",
  "/api/exercises",
  "/api/users",
];

const anonymousRoutes = [
  "/register",
  "/login"
];

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;

  const isProtectedExact = protectedExactRoutes.includes(pathname);
  const isProtectedPrefix = protectedPrefixRoutes.some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedExact || isProtectedPrefix) {
    const isAuthenticationValid = await authentication.validate(request);
    if (!isAuthenticationValid)
      return NextResponse.redirect(new URL("/login", request.url));
  }

  if (anonymousRoutes.includes(pathname)) {
    const isAuthenticationValid = await authentication.validate(request);
    if (isAuthenticationValid)
      return NextResponse.redirect(new URL("/practice", request.url));
  }
}
