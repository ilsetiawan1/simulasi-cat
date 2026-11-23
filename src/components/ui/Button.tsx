import type { ButtonHTMLAttributes } from "react";

export type ButtonVariant = "primary" | "outline" | "subtle" | "flag" | "danger";
export type ButtonShape = "rounded" | "pill";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-white border-[1.5px] border-accent hover:bg-accent-hover hover:border-accent-hover",
  outline:
    "bg-pure text-ink border-[1.5px] border-ink hover:bg-pill",
  subtle:
    "bg-pill text-ink border-[1.5px] border-ink hover:bg-border-subtle",
  flag:
    "bg-flag-bg text-flag-text border-[1.5px] border-flag-border hover:brightness-95",
  danger:
    "bg-danger-bg text-danger-text border-[1.5px] border-danger-border hover:brightness-95",
};

const SHAPE_CLASSES: Record<ButtonShape, string> = {
  rounded: "rounded-[12px]",
  pill: "rounded-full",
};

export function buttonClasses(
  variant: ButtonVariant = "primary",
  shape: ButtonShape = "rounded",
  extra = "",
): string {
  return `inline-flex min-h-[44px] items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-not-allowed disabled:opacity-50 ${VARIANT_CLASSES[variant]} ${SHAPE_CLASSES[shape]} ${extra}`.trim();
}

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  shape?: ButtonShape;
}

export function Button({
  variant = "primary",
  shape = "rounded",
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses(variant, shape, className)}
      {...props}
    />
  );
}
