import type { ReactNode } from "react";
import { TactileCard } from "./TactileCard";

interface EmptyStateProps {
  title: string;
  description: string;
  action?: ReactNode;
  tone?: "neutral" | "error";
}

export function EmptyState({
  title,
  description,
  action,
  tone = "neutral",
}: EmptyStateProps) {
  return (
    <TactileCard
      shadow="sm"
      className={`px-6 py-10 text-center ${
        tone === "error" ? "border-danger-border bg-danger-bg/40" : ""
      }`}
    >
      <p
        className={`font-mono text-base font-bold ${
          tone === "error" ? "text-danger-text" : "text-ink"
        }`}
      >
        {title}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-secondary">
        {description}
      </p>
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </TactileCard>
  );
}
