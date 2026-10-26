import { setRequestLocale } from "next-intl/server";
import { colors } from "@/lib/design-tokens";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div
      style={{ backgroundColor: colors.neutral.light, minHeight: "100vh" }}
      className="flex flex-col"
    >
      {children}
    </div>
  );
}
