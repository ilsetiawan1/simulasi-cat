import type { ReactNode } from "react";

interface SelectionHighlightProps {
  children: ReactNode;
  showHandles?: boolean;
  className?: string;
}

export function SelectionHighlight({
  children,
  showHandles = true,
  className = "",
}: SelectionHighlightProps) {
  return (
    <span
      className={`relative inline-block border-x-[2.5px] border-accent bg-accent-highlight px-3 py-0.5 text-ink ${className}`.trim()}
    >
      {showHandles && (
        <>
          <span
            aria-hidden="true"
            className="absolute -left-[6px] -top-[6px] h-2.5 w-2.5 rounded-full bg-accent"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-[6px] -right-[6px] h-2.5 w-2.5 rounded-full bg-accent"
          />
        </>
      )}
      {children}
    </span>
  );
}
