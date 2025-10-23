"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import LinkTable, { type LinkRow } from "@/components/LinkTable";

export type PublicLink = LinkRow;

type PublicLinksClientProps = {
  initialLinks: PublicLink[];
  baseUrl: string;
};

export default function PublicLinksClient({
  initialLinks,
  baseUrl,
}: PublicLinksClientProps) {
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedTerm, setDebouncedTerm] = useState<string>("");
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, 300);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    async function syncLinks() {
      try {
        setIsSyncing(true);
        const response = await fetch("/api/links", { cache: "no-store" });
        if (!response.ok) return;
        const data = await response.json();
        if (Array.isArray(data?.links)) {
          setLinks(data.links);
        }
      } finally {
        setIsSyncing(false);
      }
    }

    syncLinks();
  }, []);

  const filteredLinks = useMemo(() => {
    if (!debouncedTerm) return links;

    return links.filter((link) => {
      const haystack = `${link.alias} ${link.url}`.toLowerCase();
      return haystack.includes(debouncedTerm);
    });
  }, [links, debouncedTerm]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              LeanRiv
            </h1>
            <p className="text-sm text-muted">
              Directorio personal de redirecciones. Explorá y encontrá tu próximo link rápido.
            </p>
          </div>
          <SearchBar value={searchTerm} onChange={setSearchTerm} />
        </header>

        <main className="flex-1">
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
            {isSyncing ? "Actualizando..." : "Links públicos"}
          </div>
          <LinkTable links={filteredLinks} baseUrl={baseUrl} />
        </main>
      </div>
    </div>
  );
}
