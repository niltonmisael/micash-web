import type { Metadata } from "next";
import { Inter, Schibsted_Grotesk } from "next/font/google";
import { THEME_SCRIPT } from "@/lib/theme";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
// Display face: headings and large figures (see .figure in globals.css).
const display = Schibsted_Grotesk({ variable: "--font-display-face", subsets: ["latin"] });

export const metadata: Metadata = {
  title: { default: "MiCash", template: "%s · MiCash" },
  description: "Organize receitas, despesas e metas em um só lugar.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    // data-theme is set by THEME_SCRIPT before React hydrates, hence suppressHydrationWarning.
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className={`${inter.variable} ${display.variable} font-sans antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
