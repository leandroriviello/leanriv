"use client";

import { Search } from "lucide-react";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SearchBar({
  value,
  onChange,
  placeholder = "Buscar…",
}: SearchBarProps) {
  return (
    <div className="relative flex w-full min-w-[240px] items-center">
      <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="h-11 w-full rounded-2xl border border-border bg-[#0f0f10] pl-10 pr-4 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40"
      />
    </div>
  );
}
