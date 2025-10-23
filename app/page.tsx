import prisma from "@/lib/prisma";
import PublicLinksClient, { type PublicLink } from "./PublicLinksClient";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export default async function Home() {
  const links = await prisma.link.findMany({
    orderBy: { title: "asc" },
  });

  const serializedLinks: PublicLink[] = links.map((link) => ({
    id: link.id,
    alias: link.alias,
    url: link.url,
    title: link.title,
    createdAt: link.createdAt.toISOString(),
  }));

  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "localhost:3000";
  const protocol = host.includes("localhost") ? "http" : "https";
  const baseUrl = `${protocol}://${host}`;

  return <PublicLinksClient initialLinks={serializedLinks} baseUrl={baseUrl} />;
}
