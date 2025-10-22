import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";

type AliasPageProps = {
  params: {
    alias: string;
  };
};

export const dynamic = "force-dynamic";

export default async function AliasPage({ params }: AliasPageProps) {
  const alias = params.alias.toLowerCase();

  const link = await prisma.link.findUnique({
    where: { alias },
  });

  if (!link) {
    notFound();
  }

  redirect(link.url);
}
