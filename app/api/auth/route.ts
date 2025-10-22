import { NextRequest, NextResponse } from "next/server";
import {
  createSessionCookie,
  credentialsAreValid,
  destroySessionCookie,
  getSessionFromRequest,
} from "@/lib/auth";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  return NextResponse.json({ authenticated: Boolean(session) });
}

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 400 },
    );
  }

  const { email, password } = parsed.data;

  if (!credentialsAreValid(email, password)) {
    return NextResponse.json(
      { error: "Email o contraseña incorrectos" },
      { status: 401 },
    );
  }

  const cookie = await createSessionCookie(email);
  const response = NextResponse.json({ ok: true });
  response.cookies.set(cookie);

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(destroySessionCookie());
  return response;
}
