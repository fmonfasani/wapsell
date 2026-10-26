import { colors } from "@/lib/design-tokens";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  darkMode?: boolean;
}

export function Logo({ size = "md", darkMode = false }: LogoProps) {
  const sizes = {
    sm: "w-6 h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-xl",
    lg: "text-3xl",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`${sizes[size]} flex items-center justify-center relative`}>
        {/* W Shape */}
        <svg
          viewBox="0 0 24 24"
          className={`w-full h-full ${
            darkMode ? "text-cream" : "text-neutral-900"
          }`}
          fill="currentColor"
        >
          <path d="M2 2h4l2 10 2-10h4l2 10 2-10h4v2h-2l-3 16h-4l-2-10-2 10h-4L4 4H2V2z" />
        </svg>

        {/* Orange Dot */}
        <div
          className={`absolute -bottom-1 -right-1 w-2 h-2 rounded-full`}
          style={{ backgroundColor: colors.primary.orange }}
        />
      </div>

      {/* Brand Text */}
      <span
        className={`${textSizes[size]} font-bold ${
          darkMode ? "text-cream" : "text-neutral-900"
        }`}
      >
        Wapsell
      </span>
    </div>
  );
}
