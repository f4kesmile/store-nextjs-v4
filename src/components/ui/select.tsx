"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ChangeHandler = (value: string) => void;

export const Select: React.FC<{
  value?: string;
  onValueChange?: ChangeHandler;
  children: React.ReactNode;
}> = ({ value, onValueChange, children }) => {
  return (
    <div className="relative">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { value, onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    value?: string;
    onValueChange?: ChangeHandler;
  }
>(({ className, children, ...props }, ref) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="relative">
      <button
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        type="button"
        onClick={() => setOpen((v) => !v)}
      >
        {children}
        <svg
          className="h-4 w-4 opacity-50"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full overflow-auto rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
          {React.Children.map(
            React.Children.toArray((props as any).children).slice(1),
            (child) => {
              if (
                React.isValidElement(child) &&
                (child.type as any) === SelectContent
              ) {
                return React.cloneElement(child, {
                  onValueChange: (val: string) => {
                    (props as any).onValueChange?.(val);
                    setOpen(false);
                  },
                } as any);
              }
              return null;
            }
          )}
        </div>
      )}
    </div>
  );
});
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue: React.FC<{ placeholder?: string }> = ({
  placeholder,
}) => {
  return <span>{placeholder}</span>;
};

export const SelectContent: React.FC<{
  children: React.ReactNode;
  onValueChange?: ChangeHandler;
}> = ({ children, onValueChange }) => {
  return (
    <div className="max-h-96">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { onValueChange });
        }
        return child;
      })}
    </div>
  );
};

export const SelectItem: React.FC<{
  value: string;
  children: React.ReactNode;
  onValueChange?: ChangeHandler;
}> = ({ value, children, onValueChange }) => {
  return (
    <div
      role="option"
      className="relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground"
      onClick={() => onValueChange?.(value)}
    >
      {children}
    </div>
  );
};
