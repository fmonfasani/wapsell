import { setRequestLocale } from "next-intl/server";
import { RecoverForm } from "@/components/RecoverForm";
import { LoginStory } from "@/components/LoginStory";
import { colors } from "@/lib/design-tokens";

export default async function RecoverPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ backgroundColor: colors.neutral.light }}
    >
      <div className="w-full max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-0">
          {/* Left: Brand Story (Desktop Only) */}
          <LoginStory />

          {/* Right: Recover Form */}
          <div
            className="flex flex-col justify-center p-8 lg:p-12 rounded-lg lg:rounded-none lg:rounded-r-lg"
            style={{ backgroundColor: "white" }}
          >
            <div className="w-full max-w-sm mx-auto lg:mx-0">
              {/* Header */}
              <div className="mb-8 space-y-2">
                <h1
                  className="text-4xl font-bold"
                  style={{ color: colors.neutral.text_primary }}
                >
                  Recuperar Contraseña
                </h1>
                <p
                  style={{ color: colors.neutral.text_secondary }}
                  className="text-lg"
                >
                  Restablece tu acceso a Wapsell
                </p>
              </div>

              {/* Recover Form */}
              <RecoverForm />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
