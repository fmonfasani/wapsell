import React from "react";
import { colors, borderRadius, transitions } from "@/lib/design-tokens";

type ButtonVariant = "primary" | "secondary" | "ghost" | "outline";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled = false,
      className = "",
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      font-semibold rounded-lg transition-all ${transitions.base}
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-4 py-2 text-base",
      lg: "px-6 py-3 text-lg",
    };

    const variants = {
      primary: `
        bg-[${colors.primary.orange}] text-white
        hover:bg-[${colors.primary.orange_dark}]
        focus:ring-[${colors.primary.orange}]
      `,
      secondary: `
        bg-[${colors.secondary.blue}] text-white
        hover:bg-[${colors.secondary.blue_dark}]
        focus:ring-[${colors.secondary.blue}]
      `,
      ghost: `
        bg-transparent text-[${colors.primary.orange}]
        hover:bg-[${colors.neutral.light}]
        border border-transparent
      `,
      outline: `
        bg-transparent text-[${colors.neutral.text_primary}]
        border-2 border-[${colors.neutral.border}]
        hover:border-[${colors.primary.orange}]
        hover:text-[${colors.primary.orange}]
      `,
    };

    // Use inline styles instead of dynamic Tailwind classes
    const getVariantStyles = () => {
      switch (variant) {
        case "primary":
          return {
            backgroundColor: colors.primary.orange,
            color: "white",
          };
        case "secondary":
          return {
            backgroundColor: colors.secondary.blue,
            color: "white",
          };
        case "ghost":
          return {
            backgroundColor: "transparent",
            color: colors.primary.orange,
          };
        case "outline":
          return {
            backgroundColor: "transparent",
            color: colors.neutral.text_primary,
            border: `2px solid ${colors.neutral.border}`,
          };
        default:
          return {};
      }
    };

    return (
      <button
        ref={ref}
        style={getVariantStyles()}
        className={`${baseStyles} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
