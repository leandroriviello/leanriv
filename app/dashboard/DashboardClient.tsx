"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SearchBar from "@/components/SearchBar";
import LinkTable, { type LinkRow } from "@/components/LinkTable";
import NewLinkModal, {
  type LinkFormData,
} from "@/components/NewLinkModal";
import { Plus } from "lucide-react";

export type DashboardLink = LinkRow;

type DashboardClientProps = {
  initialLinks: DashboardLink[];
  userEmail: string;
};

export default function DashboardClient({
  initialLinks,
  userEmail,
}: DashboardClientProps) {
  const router = useRouter();
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedTerm, setDebouncedTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const filteredLinks = useMemo(() => {
    if (!debouncedTerm) return links;

    return links.filter((link) => {
      const haystack = `${link.alias} ${link.url}`.toLowerCase();
      return haystack.includes(debouncedTerm);
    });
  }, [links, debouncedTerm]);

  async function handleCreateLink(data: LinkFormData) {
    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        const errorMessage =
          typeof payload?.error === "string"
            ? payload.error
            : Object.values(payload?.error ?? {})
                .flat()
                .join(". ") || "No pudimos crear el link.";
        toast.error(errorMessage);
        return false;
      }

      const { link } = await response.json();
      setLinks((prev) => [
        {
          id: link.id,
          alias: link.alias,
          url: link.url,
          createdAt: link.createdAt,
        },
        ...prev,
      ]);
      toast.success("Link creado con éxito ✅");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al crear el link.");
      return false;
    }
  }

  async function handleDeleteLink(id: number) {
    const link = links.find((item) => item.id === id);
    if (!link) return;

    const aliasText = `/${link.alias}`;

    try {
      const response = await fetch(`/api/links/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => ({}));
        toast.error(payload?.error ?? "No pudimos eliminar el link.");
        return;
      }

      setLinks((prev) => prev.filter((item) => item.id !== id));
      toast.success(`Eliminaste ${aliasText}`);
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al eliminar el link.");
    }
  }

  async function handleCopyLink(alias: string) {
    try {
      const url = `${window.location.origin}/${alias}`;
      await navigator.clipboard.writeText(url);
      toast.success("Copiado al portapapeles");
    } catch {
      toast.error("No pudimos copiar el link.");
    }
  }

  async function handleLogout() {
    try {
      setIsLoggingOut(true);
      await fetch("/api/auth", { method: "DELETE" });
      router.push("/login");
      router.refresh();
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <header className="flex flex-col gap-6 rounded-3xl border border-border bg-card/80 p-6 shadow-[0_30px_80px_-50px_rgba(166,255,0,0.5)] sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Tu panel
            </p>
            <h1 className="text-2xl font-semibold text-foreground">
              LeanRiv Dashboard
            </h1>
            <p className="text-sm text-muted">{userEmail}</p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchBar
              value={searchTerm}
              onChange={setSearchTerm}
              placeholder="Buscar alias o URL…"
            />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Nuevo link
              </button>
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="rounded-2xl border border-border px-4 py-3 text-sm text-muted transition hover:border-accent hover:text-foreground disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut ? "Cerrando..." : "Salir"}
              </button>
            </div>
          </div>
        </header>

        <main className="flex-1 rounded-3xl border border-border bg-card/80 p-6 shadow-[0_40px_120px_-70px_rgba(166,255,0,0.45)]">
          <LinkTable
            links={filteredLinks}
            onDelete={handleDeleteLink}
            onCopy={handleCopyLink}
          />
        </main>
      </div>

      <NewLinkModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={async (data) => {
          const ok = await handleCreateLink(data);
          if (ok) {
            setIsModalOpen(false);
          }
        }}
      />
    </div>
  );
}
