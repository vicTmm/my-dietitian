import type { ButtonHTMLAttributes } from "react";
import { cva } from "class-variance-authority";
import { Slot } from "@radix-ui/react-slot";
import { clsx } from "clsx";
export const buttonVariants = cva("button", {
  variants: {
    variant: {
      default: "button-primary",
      outline: "button-outline",
      ghost: "button-ghost",
      yellow: "button-yellow",
      danger: "button-danger",
    },
    size: { default: "", sm: "button-sm", icon: "button-icon" },
  },
  defaultVariants: { variant: "default", size: "default" },
});
type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "outline" | "ghost" | "yellow" | "danger";
  size?: "default" | "sm" | "icon";
  asChild?: boolean;
};
export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: Props) {
  const Component = asChild ? Slot : "button";
  return (
    <Component
      className={clsx(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}
