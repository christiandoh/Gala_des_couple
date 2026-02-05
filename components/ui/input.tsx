import * as React from "react";
import { cn } from "@/lib/utils";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "border-input focus-visible:border-ring focus-visible:ring-ring/50 h-8 rounded-lg border bg-transparent px-2.5 py-1 text-sm transition-colors placeholder:text-muted-foreground w-full min-w-0 outline-none focus-visible:ring-3 disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
}

export { Input };
