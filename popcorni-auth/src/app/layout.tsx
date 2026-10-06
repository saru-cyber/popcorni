import type { Metadata } from "next";
import { Outfit, Sora } from "next/font/google";
import { AppProviders } from "@/components/providers/AppProviders";
import { PAGE_COPY } from "@/config/constants";
import "./globals.css";

// next/font requires literal arguments. Keep these aligned with FONT_SETUP.
const display = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const body = Sora({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: PAGE_COPY.homeTitle,
  description: PAGE_COPY.homeDescription,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
