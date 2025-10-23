"use client";

import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import type { LinkRow } from "@/components/LinkTable";

export type EditLinkPayload = {
  id: number;
  title: string;
  alias: string;
  url: string;
};

type EditLinkModalProps = {
  open: boolean;
  link: LinkRow | null;
  onClose: () => void;
  onUpdate: (data: EditLinkPayload) => Promise<boolean>;
};

export default function EditLinkModal({
  open,
  link,
  onClose,
  onUpdate,
}: EditLinkModalProps) {
  const [title, setTitle] = useState(link?.title ?? "");
  const [alias, setAlias] = useState(link?.alias ?? "");
  const [url, setUrl] = useState(link?.url ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    const timer = setTimeout(() => {
      setTitle(link?.title ?? "");
      setAlias(link?.alias ?? "");
      setUrl(link?.url ?? "");
    }, 0);

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeydown);
    };
  }, [open, link, onClose]);

  useEffect(() => {
    if (!open) return;
    const firstInput = dialogRef.current?.querySelector("input");
    firstInput?.focus();
  }, [open]);

  if (!open || !link) return null;

  function handleClose() {
    setIsSubmitting(false);
    onClose();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    if (!link) return;

    const payload: EditLinkPayload = {
      id: link.id,
      title: title.trim(),
      alias: alias.trim().toLowerCase(),
      url: url.trim(),
    };

    if (!payload.title || !payload.alias || !payload.url) return;

    setIsSubmitting(true);
    const ok = await onUpdate(payload);
    setIsSubmitting(false);
    if (ok) {
      handleClose();
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={handleClose}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-3xl border border-border bg-[#121212] p-6 shadow-[0_50px_120px_-80px_rgba(166,255,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Editar link
            </h2>
            <p className="mt-1 text-sm text-muted">
              Actualizá el título, alias o URL según necesites.
            </p>
          </div>
          <button
            className="rounded-xl border border-transparent p-2 text-muted transition hover:border-border hover:text-foreground"
            onClick={handleClose}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="edit-title" className="text-sm font-medium text-muted">
              Título
            </label>
            <input
              id="edit-title"
              name="title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
              maxLength={80}
              className="h-11 w-full rounded-2xl border border-border bg-[#0f0f10] px-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-alias" className="text-sm font-medium text-muted">
              Alias
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-[#0f0f10] px-4">
              <span className="text-muted">/</span>
              <input
                id="edit-alias"
                name="alias"
                value={alias}
                onChange={(event) => setAlias(event.target.value.toLowerCase())}
                required
                pattern="[a-z0-9-]+"
                title="Usá sólo letras minúsculas, números o guiones."
                className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="edit-url" className="text-sm font-medium text-muted">
              URL destino
            </label>
            <input
              id="edit-url"
              name="url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              required
              className="h-11 w-full rounded-2xl border border-border bg-[#0f0f10] px-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-2xl border border-border px-4 py-2.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
