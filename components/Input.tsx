import React from "react";
import { colors, borderRadius } from "@/lib/design-tokens";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      icon,
      id,
      className = "",
      disabled = false,
      ...props
    },
    ref
  ) => {
    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-2"
            style={{ color: colors.neutral.text_primary }}
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none text-gray-400">
              {icon}
            </div>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            className={`
              w-full px-4 py-2.5 text-base font-normal
              transition-all duration-200
              focus:outline-none
              disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed
              ${icon ? "pl-10" : ""}
              ${error ? "border-2" : "border border-[" + colors.neutral.border + "]"}
              ${className}
            `}
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: error ? colors.semantic.error : colors.neutral.border,
              borderRadius: borderRadius.md,
              color: colors.neutral.text_primary,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = colors.primary.orange;
              e.currentTarget.style.boxShadow = `0 0 0 3px rgba(217, 119, 87, 0.1)`;
            }}
            onBlur={(e) => {
              e.currentTarget.style.boxShadow = "none";
              if (!error) {
                e.currentTarget.style.borderColor = colors.neutral.border;
              }
            }}
            {...props}
          />
        </div>

        {error && (
          <p
            className="text-sm mt-1.5 font-medium"
            style={{ color: colors.semantic.error }}
          >
            {error}
          </p>
        )}

        {helperText && !error && (
          <p
            className="text-sm mt-1.5"
            style={{ color: colors.neutral.text_tertiary }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
