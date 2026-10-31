import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  shadow?: "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  shadow = "sm",
}: CardProps) {
  const shadowClasses = {
    sm: "shadow-sm",
    md: "shadow-md",
    lg: "shadow-lg",
  };

  return (
    <div
      className={`bg-white border border-neutral-200 rounded-xl p-6 md:p-8 ${shadowClasses[shadow]} ${className}`}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  title?: string;
  description?: string;
  children?: ReactNode;
}

export function CardHeader({ title, description, children }: CardHeaderProps) {
  return (
    <div className="mb-6 md:mb-8 pb-6 md:pb-8 border-b border-neutral-200">
      {title && <h2 className="text-2xl md:text-3xl font-semibold text-neutral-900 mb-2">{title}</h2>}
      {description && <p className="text-neutral-600">{description}</p>}
      {children}
    </div>
  );
}

interface CardBodyProps {
  children: ReactNode;
  className?: string;
}

export function CardBody({ children, className = "" }: CardBodyProps) {
  return <div className={`space-y-4 ${className}`}>{children}</div>;
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = "" }: CardFooterProps) {
  return <div className={`mt-8 pt-6 border-t border-neutral-200 flex gap-3 ${className}`}>{children}</div>;
}
