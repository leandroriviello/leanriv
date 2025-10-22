"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";

export type LinkFormData = {
  alias: string;
  url: string;
};

type NewLinkModalProps = {
  open: boolean;
  onClose: () => void;
  onCreate: (data: LinkFormData) => Promise<boolean>;
};

export default function NewLinkModal({
  open,
  onClose,
  onCreate,
}: NewLinkModalProps) {
  const [alias, setAlias] = useState("");
  const [url, setUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  const resetForm = useCallback(() => {
    setAlias("");
    setUrl("");
    setIsSubmitting(false);
  }, []);

  const closeModal = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  useEffect(() => {
    if (!open) return;

    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeModal();
      }
    }

    window.addEventListener("keydown", handleKeydown);
    return () => window.removeEventListener("keydown", handleKeydown);
  }, [open, closeModal]);

  useEffect(() => {
    if (!open) return;
    const firstInput = dialogRef.current?.querySelector("input");
    firstInput?.focus();
  }, [open]);

  if (!open) return null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;

    const data = {
      alias: alias.trim().toLowerCase(),
      url: url.trim(),
    };

    if (!data.alias || !data.url) return;

    setIsSubmitting(true);
    const ok = await onCreate(data);
    if (ok) {
      closeModal();
    }
    setIsSubmitting(false);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
      onClick={closeModal}
    >
      <div
        ref={dialogRef}
        className="w-full max-w-md rounded-3xl border border-border bg-[#121212] p-6 shadow-[0_50px_120px_-80px_rgba(166,255,0,0.6)]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              Crear nuevo link
            </h2>
            <p className="mt-1 text-sm text-muted">
              Elegí un alias memorable y la URL a la que querés redirigir.
            </p>
          </div>
          <button
            className="rounded-xl border border-transparent p-2 text-muted transition hover:border-border hover:text-foreground"
            onClick={closeModal}
            aria-label="Cerrar"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="alias" className="text-sm font-medium text-muted">
              Alias
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-border bg-[#0f0f10] px-4">
              <span className="text-muted">/</span>
              <input
                id="alias"
                name="alias"
                value={alias}
                onChange={(event) => setAlias(event.target.value.toLowerCase())}
                placeholder="ej: aiwebs"
                required
                pattern="[a-z0-9-]+"
                title="Usá sólo letras minúsculas, números o guiones."
                className="h-11 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="url" className="text-sm font-medium text-muted">
              URL destino
            </label>
            <input
              id="url"
              name="url"
              type="url"
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              placeholder="https://..."
              required
              className="h-11 w-full rounded-2xl border border-border bg-[#0f0f10] px-4 text-sm text-foreground outline-none placeholder:text-muted focus:border-accent focus:ring-2 focus:ring-accent/40"
            />
          </div>

          <div className="flex justify-end gap-3 pt-1">
            <button
              type="button"
              onClick={closeModal}
              className="rounded-2xl border border-border px-4 py-2.5 text-sm text-muted transition hover:border-accent hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-2xl bg-accent px-4 py-2.5 text-sm font-semibold text-black transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Guardando..." : "Crear link"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
