import { InputHTMLAttributes, TextareaHTMLAttributes, ReactNode } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: ReactNode;
}

export function Input({
  label,
  error,
  helper,
  icon,
  id,
  className = "",
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={`form-input ${icon ? "pl-10" : ""} ${error ? "border-error-DEFAULT focus:ring-error-light" : ""} ${className}`}
          {...props}
        />
        {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400">{icon}</div>}
      </div>
      {error && <span className="form-error">{error}</span>}
      {helper && <span className="form-helper">{helper}</span>}
    </div>
  );
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
}

export function Textarea({
  label,
  error,
  helper,
  id,
  className = "",
  ...props
}: TextareaProps) {
  const textareaId = id || `textarea-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={textareaId} className="form-label">
          {label}
        </label>
      )}
      <textarea
        id={textareaId}
        className={`form-textarea ${error ? "border-error-DEFAULT focus:ring-error-light" : ""} ${className}`}
        {...props}
      />
      {error && <span className="form-error">{error}</span>}
      {helper && <span className="form-helper">{helper}</span>}
    </div>
  );
}
