import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email) {
    return NextResponse.json({ message: "Email is required" }, { status: 400 });
  }

  return NextResponse.json({ message: "Mock deletion request accepted." }, { status: 200 });
}
