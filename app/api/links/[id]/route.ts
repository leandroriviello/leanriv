import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getSessionFromRequest } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import { z } from "zod";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

const updateSchema = z.object({
  title: z
    .string()
    .min(2, "El título debe tener al menos 2 caracteres")
    .max(80, "El título no puede superar los 80 caracteres"),
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

export async function PUT(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Identificador inválido" },
      { status: 400 },
    );
  }

  const json = await request.json().catch(() => ({}));
  const parsed = updateSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { title, alias, url } = parsed.data;

  try {
    const link = await prisma.link.update({
      where: { id },
      data: { title, alias, url },
    });
    return NextResponse.json({ link });
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

    return NextResponse.json(
      { error: "No se pudo actualizar el link" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const session = await getSessionFromRequest(request);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { id: idParam } = await context.params;
  const id = Number(idParam);

  if (Number.isNaN(id)) {
    return NextResponse.json(
      { error: "Identificador inválido" },
      { status: 400 },
    );
  }

  try {
    await prisma.link.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2025"
    ) {
      return NextResponse.json(
        { error: "No se encontró el link solicitado" },
        { status: 404 },
      );
    }

    return NextResponse.json(
      { error: "No se pudo eliminar el link" },
      { status: 500 },
    );
  }
}
