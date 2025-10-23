import prisma from "@/lib/prisma";
import { requireSession } from "@/lib/auth";
import DashboardClient, { type DashboardLink } from "./DashboardClient";
import { headers } from "next/headers";

export const metadata = {
  title: "Panel de enlaces | LeanRiv",
};

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await requireSession();

  const links = await prisma.link.findMany({
    orderBy: { createdAt: "desc" },
  });

  const serializedLinks: DashboardLink[] = links.map((link) => ({
    id: link.id,
    alias: link.alias,
    url: link.url,
    createdAt: link.createdAt.toISOString(),
  }));

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return (
    <DashboardClient
      initialLinks={serializedLinks}
      userEmail={session.email}
      baseUrl={baseUrl}
    />
  );
}
