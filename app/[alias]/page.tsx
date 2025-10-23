import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

type AliasPageProps = {
  params: Promise<{
    alias: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function AliasPage({ params }: AliasPageProps) {
  const resolvedParams = await params;
  const rawAlias = resolvedParams?.alias;

  if (typeof rawAlias !== "string" || rawAlias.trim().length === 0) {
    notFound();
  }

  const alias = rawAlias.toLowerCase();

  const link = await prisma.link.findUnique({
    where: { alias },
  });

  if (!link) {
    notFound();
  }

  redirect(link.url);
}
