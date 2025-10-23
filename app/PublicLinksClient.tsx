"use client";

import { useEffect, useMemo, useState } from "react";
import SearchBar from "@/components/SearchBar";
import type { LinkRow } from "@/components/LinkTable";

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
          setLinks(
            [...data.links].sort((a, b) =>
              a.title.localeCompare(b.title, "es", { sensitivity: "base" }),
            ),
          );
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
      const haystack = `${link.title ?? ""} ${link.alias ?? ""} ${link.url ?? ""}`.toLowerCase();
      return haystack.includes(debouncedTerm);
    });
  }, [links, debouncedTerm]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-6 py-12">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Links de interés
        </h1>

        <div className="flex flex-col gap-6">
          <SearchBar value={searchTerm} onChange={setSearchTerm} />

          <div className="text-xs uppercase tracking-[0.3em] text-muted">
            {isSyncing ? "Actualizando..." : `${filteredLinks.length} enlace(s)`}
          </div>

          <div className="space-y-3">
            {filteredLinks.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-[#0f0f10] p-6 text-center text-sm text-muted">
                No encontramos enlaces con ese término.
              </div>
            ) : (
              filteredLinks.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-4 rounded-2xl border border-border/70 bg-[#0f0f10] px-5 py-4"
                >
                  <div className="min-w-0">
                    <p className="truncate text-lg font-medium text-foreground">
                      {link.title}
                    </p>
                    <p className="truncate text-xs text-muted">/{link.alias}</p>
                  </div>
                  <a
                    href={`${baseUrl}/${link.alias}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl bg-accent px-4 py-2 text-sm font-semibold text-foreground transition hover:opacity-80 whitespace-nowrap"
                  >
                    Ir al link
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
