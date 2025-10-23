"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import SearchBar from "@/components/SearchBar";
import LinkTable, { type LinkRow } from "@/components/LinkTable";
import NewLinkModal, {
  type LinkFormData,
} from "@/components/NewLinkModal";
import EditLinkModal, {
  type EditLinkPayload,
} from "@/components/EditLinkModal";
import { Plus } from "lucide-react";

export type DashboardLink = LinkRow;

type DashboardClientProps = {
  initialLinks: DashboardLink[];
  userEmail: string;
  baseUrl: string;
};

export default function DashboardClient({
  initialLinks,
  userEmail,
  baseUrl,
}: DashboardClientProps) {
  const router = useRouter();
  const [links, setLinks] = useState<LinkRow[]>(initialLinks);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [debouncedTerm, setDebouncedTerm] = useState<string>("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingLink, setEditingLink] = useState<LinkRow | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedTerm(searchTerm.trim().toLowerCase());
    }, 220);

    return () => clearTimeout(timeout);
  }, [searchTerm]);

  const filteredLinks = useMemo(() => {
    if (!debouncedTerm) return links;

    return links.filter((link) => {
      const haystack = `${link.title} ${link.alias} ${link.url}`.toLowerCase();
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
          title: link.title,
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

  function openEdit(link: LinkRow) {
    setEditingLink(link);
    setIsEditOpen(true);
  }

  async function handleUpdateLink(payload: EditLinkPayload) {
    try {
      const response = await fetch(`/api/links/${payload.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        const errorMessage =
          typeof data?.error === "string"
            ? data.error
            : Object.values(data?.error ?? {})
                .flat()
                .join(". ") || "No pudimos actualizar el link.";
        toast.error(errorMessage);
        return false;
      }

      const { link } = await response.json();
      setLinks((prev) =>
        prev.map((item) =>
          item.id === link.id
            ? {
                id: link.id,
                alias: link.alias,
                url: link.url,
                title: link.title,
                createdAt: link.createdAt,
              }
            : item,
        ),
      );
      toast.success("Link actualizado ✅");
      return true;
    } catch (error) {
      console.error(error);
      toast.error("Ocurrió un error al actualizar el link.");
      return false;
    }
  }

  async function handleCopyLink(alias: string) {
    try {
      const url = `${baseUrl}/${alias}`;
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

  useEffect(() => {
    async function fetchLinks() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/links", {
          method: "GET",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("No pudimos cargar los links");
        }

        const data = await response.json();
        if (Array.isArray(data?.links)) {
          setLinks(data.links);
        }
      } catch (error) {
        console.error(error);
        toast.error("No pudimos sincronizar los links");
      } finally {
        setIsLoading(false);
      }
    }

    fetchLinks();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-10 px-6 py-12">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">
              LeanRiv
            </h1>
            <p className="text-sm text-muted">
              Accedé a tus redirecciones rápidas. Sesión: {userEmail}
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <SearchBar value={searchTerm} onChange={setSearchTerm} />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="flex items-center gap-2 rounded-2xl bg-accent px-5 py-3 text-sm font-semibold text-background transition hover:opacity-80 whitespace-nowrap"
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

        <main className="flex-1">
          <div className="mb-4 text-xs uppercase tracking-[0.3em] text-muted">
            {isLoading ? "Sincronizando..." : "Tus links"}
          </div>
          <LinkTable
            links={filteredLinks}
            baseUrl={baseUrl}
            onDelete={handleDeleteLink}
            onCopy={handleCopyLink}
            onEdit={openEdit}
          />
        </main>
      </div>

      <NewLinkModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={(data) => handleCreateLink(data)}
      />
      <EditLinkModal
        open={isEditOpen}
        link={editingLink}
        onClose={() => {
          setIsEditOpen(false);
          setEditingLink(null);
        }}
        onUpdate={handleUpdateLink}
      />
    </div>
  );
}
