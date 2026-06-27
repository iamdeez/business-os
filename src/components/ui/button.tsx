import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#4f46e5] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "text-white shadow-sm active:scale-[0.98]",
        outline:
          "border border-[var(--surface-border)] bg-white text-[var(--text)] hover:bg-[var(--surface-low)]",
        ghost:
          "text-[var(--text-muted)] hover:bg-[var(--surface-container)] hover:text-[var(--text)]",
        destructive:
          "bg-[var(--error)] text-white hover:bg-[var(--error)]/90",
      },
      size: {
        default: "h-[44px] px-5 text-base",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const gradientStyle =
      variant === "default" || variant === undefined
        ? { background: "linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)", ...style }
        : style;
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        style={gradientStyle}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
