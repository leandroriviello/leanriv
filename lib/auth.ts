import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { NextRequest } from "next/server";
import {
  createSessionCookie,
  destroySessionCookie,
  sessionCookieName,
  verifySessionToken,
  type SessionPayload,
} from "@/lib/session";

function requireEnv(name: "ADMIN_EMAIL" | "ADMIN_PASSWORD") {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export function getAdminCredentials() {
  return {
    email: requireEnv("ADMIN_EMAIL"),
    password: requireEnv("ADMIN_PASSWORD"),
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const token = cookies().get(sessionCookieName)?.value;
  return verifySessionToken(token);
}

export async function requireSession(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export async function getSessionFromRequest(
  request: NextRequest,
): Promise<SessionPayload | null> {
  const token = request.cookies.get(sessionCookieName)?.value;
  return verifySessionToken(token);
}

export function isAuthenticatedEmail(email: string) {
  return email === getAdminCredentials().email;
}

export function credentialsAreValid(email: string, password: string) {
  const creds = getAdminCredentials();
  return email === creds.email && password === creds.password;
}

export { createSessionCookie, destroySessionCookie, sessionCookieName };
