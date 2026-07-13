import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export const Button = React.forwardRef(({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
        {
          "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm": variant === "default",
          "bg-secondary text-secondary-foreground hover:bg-secondary/80": variant === "secondary",
          "bg-destructive text-destructive-foreground hover:bg-destructive/90": variant === "destructive",
          "bg-outline text-foreground hover:bg-accent hover:text-accent-foreground border": variant === "outline",
          "text-primary hover:bg-primary/10": variant === "ghost",
          "bg-success text-success-foreground hover:bg-success/90 shadow-sm": variant === "success",
        },
        {
          "h-10 px-4 py-2": size === "default",
          "h-9 rounded-lg px-3": size === "sm",
          "h-11 rounded-xl px-8": size === "lg",
          "h-12 rounded-xl px-6 text-base": size === "xl",
          "h-9 w-9 rounded-lg": size === "icon",
        },
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"
