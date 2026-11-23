import type { ReactNode } from "react";

type ShadowSize = "sm" | "md" | "none";

interface TactileCardProps {
  children: ReactNode;
  className?: string;
  shadow?: ShadowSize;
  borderStrong?: boolean;
}

const SHADOW_CLASS: Record<ShadowSize, string> = {
  sm: "shadow-[0_4px_0_#181816]",
  md: "shadow-[0_6px_0_#181816]",
  none: "",
};

export function TactileCard({
  children,
  className = "",
  shadow = "md",
  borderStrong = false,
}: TactileCardProps) {
  const borderClass = borderStrong ? "border-2 border-ink" : "border-[1.5px] border-ink";
  return (
    <div
      className={`rounded-[22px] bg-card ${borderClass} ${SHADOW_CLASS[shadow]} ${className}`.trim()}
    >
      {children}
    </div>
  );
}
