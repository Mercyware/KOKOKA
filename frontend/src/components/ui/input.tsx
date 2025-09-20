import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-siohioma-lg border border-gray-300 bg-white px-siohioma-md py-siohioma-sm",
          "text-siohioma-base text-gray-900 transition-all duration-200",
          "placeholder:text-gray-500 placeholder:font-siohioma-normal",
          "focus:outline-none focus:ring-2 focus:ring-siohioma-primary/20 focus:border-siohioma-primary",
          "hover:border-gray-400",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
          "file:border-0 file:bg-transparent file:text-siohioma-sm file:font-siohioma-medium file:text-gray-700",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
