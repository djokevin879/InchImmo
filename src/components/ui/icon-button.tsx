import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const iconButtonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground shadow-sm",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        soft: "bg-primary/10 text-primary hover:bg-primary/20",
        glass: "bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20",
      },
      size: {
        xs: "h-7 w-7 rounded-sm p-1",
        sm: "h-8 w-8 rounded-md p-1.5",
        md: "h-10 w-10 rounded-md p-2",
        lg: "h-12 w-12 rounded-lg p-2.5",
        xl: "h-14 w-14 rounded-xl p-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
)

export interface IconButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof iconButtonVariants> {
  asChild?: boolean
  icon?: React.ReactNode
  iconClassName?: string
}

const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ className, variant, size, asChild = false, icon, iconClassName, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
    // Automatically determine icon size based on button size if not provided
    const iconSizeMap = {
      xs: "h-3.5 w-3.5",
      sm: "h-4 w-4",
      md: "h-5 w-5",
      lg: "h-6 w-6",
      xl: "h-7 w-7",
    }

    const defaultIconSize = iconSizeMap[size as keyof typeof iconSizeMap] || iconSizeMap.md

    // We use a wrapper for the icon to ensure it remains centered and sized correctly
    const iconContent = icon ? (
      <span className={cn("flex items-center justify-center", defaultIconSize, iconClassName)}>
        {icon}
      </span>
    ) : children

    return (
      <Comp
        className={cn(iconButtonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      >
        {iconContent}
      </Comp>
    )
  }
)
IconButton.displayName = "IconButton"

export { IconButton, iconButtonVariants }
