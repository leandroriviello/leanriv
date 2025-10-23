"use client";

import { Copy, Trash2 } from "lucide-react";

export type LinkRow = {
  id: number;
  alias: string;
  url: string;
  createdAt: string;
};

type LinkTableProps = {
  links: LinkRow[];
  baseUrl: string;
  onDelete: (id: number) => void;
  onCopy: (alias: string) => void;
};

const dateFormatter = new Intl.DateTimeFormat("es-AR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export default function LinkTable({
  links,
  baseUrl,
  onDelete,
  onCopy,
}: LinkTableProps) {
  if (!links.length) {
    return (
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 text-center">
        <p className="text-lg font-medium text-muted">
          Sin resultados por ahora.
        </p>
        <p className="max-w-sm text-sm text-muted">
          Creá tu primer link con el botón “Nuevo link” o modificá tu búsqueda.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border/70 bg-[#0f0f10]">
      <table className="min-w-full border-collapse text-sm">
        <thead className="bg-[#131313] text-left text-xs uppercase tracking-wider text-muted">
          <tr>
            <th className="px-4 py-3 font-medium">Alias</th>
            <th className="px-4 py-3 font-medium">URL destino</th>
            <th className="px-4 py-3 font-medium">Creado</th>
            <th className="px-4 py-3 text-right font-medium">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {links.map((link) => (
            <tr
              key={link.id}
              className="border-t border-border/60 transition hover:bg-[#161616]"
            >
              <td className="px-4 py-3 font-semibold text-foreground">
                <a
                  href={`${baseUrl}/${link.alias}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent transition hover:opacity-80"
                  title={`${baseUrl}/${link.alias}`}
                >
                  {baseUrl.replace(/^https?:\/\//, "")}/{link.alias}
                </a>
              </td>
              <td className="px-4 py-3">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="line-clamp-1 text-sm text-accent transition hover:underline"
                  title={link.url}
                >
                  {link.url}
                </a>
              </td>
              <td className="px-4 py-3 text-sm text-muted">
                {dateFormatter.format(new Date(link.createdAt))}
              </td>
              <td className="px-4 py-3">
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => onCopy(link.alias)}
                    className="group flex h-9 w-9 items-center justify-center rounded-2xl border border-transparent text-muted transition hover:border-accent hover:text-foreground"
                    title="Copiar URL corta"
                  >
                    <Copy className="h-4 w-4 group-active:scale-95" />
                  </button>
                  <button
                    onClick={() => onDelete(link.id)}
                    className="group flex h-9 w-9 items-center justify-center rounded-2xl border border-border text-muted transition hover:border-[#ff4d4d] hover:text-[#ff8080]"
                    title="Eliminar"
                  >
                    <Trash2 className="h-4 w-4 group-active:scale-95" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
