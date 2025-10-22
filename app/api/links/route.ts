import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { Prisma } from "@prisma/client";

const linkSchema = z.object({
  alias: z
    .string()
    .min(2, "El alias debe tener al menos 2 caracteres")
    .max(48, "El alias debe tener como máximo 48 caracteres")
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, "Solo se permiten letras, números y guiones"),
  url: z
    .string()
    .min(1, "La URL es obligatoria")
    .url("Debe ser una URL válida"),
});

export async function GET(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ links });
}

export async function POST(request: NextRequest) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = linkSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { alias, url } = parsed.data;

  try {
    const link = await prisma.link.create({
      data: { alias, url },
    });

    return NextResponse.json({ link }, { status: 201 });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: { alias: ["Ese alias ya está en uso"] } },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { error: "Ocurrió un error al crear el link" },
      { status: 500 },
    );
  }
}
