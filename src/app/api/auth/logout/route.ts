import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const response = NextResponse.redirect(
    new URL("/", req.url)
  );

  response.cookies.set("smt_session", "", {
    path: "/",
    maxAge: 0,
  });

  return response;
}