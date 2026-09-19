import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 font-medium select-none transition-opacity duration-150 ease-out active:opacity-80 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-fg",
        surface: "bg-surface text-fg border border-border",
        ghost: "bg-transparent text-fg",
        muted: "bg-bg text-fg border border-border",
      },
      size: {
        lg: "h-14 px-6 text-base rounded-lg",
        md: "h-12 px-4 text-sm rounded-md",
        icon: "size-14 rounded-lg",
        pill: "h-10 px-4 text-sm rounded-full",
      },
    },
    defaultVariants: { variant: "primary", size: "lg" },
  },
);

type Props = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, type = "button", ...props }: Props) {
  return <button type={type} className={cn(buttonVariants({ variant, size }), className)} {...props} />;
}
