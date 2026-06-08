import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-[3px] text-[11px] font-medium tracking-wide transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800/50",
        secondary:
          "bg-stone-100 text-stone-600 border-stone-200 dark:bg-stone-800/50 dark:text-stone-400 dark:border-stone-700/50",
        destructive:
          "bg-red-50 text-red-800 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800/50",
        outline:
          "border-border text-foreground bg-transparent",
        success:
          "bg-green-50 text-green-800 border-green-200 dark:bg-green-950/40 dark:text-green-300 dark:border-green-800/50",
        warning:
          "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50",
        purple:
          "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800/50",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

// Optional dot indicator
function BadgeDot({ className }: { className?: string }) {
  return (
    <span className={cn("w-[5px] h-[5px] rounded-full bg-current opacity-70 flex-shrink-0", className)} />
  )
}

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean
}

function Badge({ className, variant, dot, children, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props}>
      {dot && <BadgeDot />}
      {children}
    </div>
  )
}

export { Badge, BadgeDot, badgeVariants }