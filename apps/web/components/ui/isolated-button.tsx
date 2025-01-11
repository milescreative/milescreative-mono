import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  children?: React.ReactNode;
}

const IsoButton = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <div className={cn(className, "isolate")}>
        <Comp ref={ref} {...props}>
          {children}
        </Comp>
      </div>
    );
  },
);

IsoButton.displayName = "IsoButton";

export { IsoButton };
