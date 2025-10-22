import { SignJWT, jwtVerify, type JWTPayload } from "jose";

export type SessionPayload = {
  email: string;
};

const SESSION_COOKIE = "leanriv_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 días
const encoder = new TextEncoder();

function getSessionSecret() {
  const value = process.env["SESSION_SECRET"] ?? process.env["NEXTAUTH_SECRET"];
  if (!value) {
    throw new Error(
      "Falta la variable de entorno SESSION_SECRET o NEXTAUTH_SECRET",
    );
  }
  return encoder.encode(value);
}

function mapPayload(payload: JWTPayload): SessionPayload | null {
  const email = typeof payload.email === "string" ? payload.email : undefined;
  return email ? { email } : null;
}

async function signSessionToken(email: string) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(getSessionSecret());
}

export async function createSessionCookie(email: string) {
  return {
    name: SESSION_COOKIE,
    value: await signSessionToken(email),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  };
}

export function destroySessionCookie() {
  return {
    name: SESSION_COOKIE,
    value: "",
    maxAge: 0,
    path: "/",
  };
}

export async function verifySessionToken(
  token: string | undefined,
): Promise<SessionPayload | null> {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, getSessionSecret());
    return mapPayload(payload);
  } catch {
    return null;
  }
}

export const sessionCookieName = SESSION_COOKIE;
