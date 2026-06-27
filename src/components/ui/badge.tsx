import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-[#e9ddff] text-[var(--primary)]",
        active: "bg-[#dcfce7] text-[#15803d]",
        inactive: "bg-[var(--surface-high)] text-[var(--text-muted)]",
        warning: "bg-[#fef9c3] text-[#a16207]",
        error: "bg-[#fee2e2] text-[var(--error)]",
        count: "bg-[var(--primary)] text-white min-w-[18px] justify-center px-1.5",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
