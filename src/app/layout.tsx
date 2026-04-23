import { QueryProvider } from "@components/providers/QueryProvider";
import { ToastProvider } from "@components/providers/ToastProvider";
import { env } from "@lib/env";
import type { Metadata } from "next";
import { DM_Sans, JetBrains_Mono, Syne } from "next/font/google";

import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500"],
  display: "swap",
});

const productionUrl = "https://nexusflow.abhashchakraborty.tech";

export const metadata: Metadata = {
  title: `${env.NEXT_PUBLIC_APP_NAME} | Visual Workflow Designer`,
  description: "Design, validate, and simulate workflow automations in a polished visual canvas.",
  metadataBase: new URL(productionUrl),
  applicationName: env.NEXT_PUBLIC_APP_NAME,
  authors: [{ name: "Abhash Chakraborty", url: productionUrl }],
  creator: "Abhash Chakraborty",
  publisher: "Abhash Chakraborty",
  alternates: {
    canonical: "/designer",
  },
  openGraph: {
    title: `${env.NEXT_PUBLIC_APP_NAME} | Visual Workflow Designer`,
    description: "Design, validate, and simulate workflow automations in a polished visual canvas.",
    url: `${productionUrl}/designer`,
    siteName: env.NEXT_PUBLIC_APP_NAME,
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${syne.variable} ${dmSans.variable} ${jetbrainsMono.variable} min-h-screen bg-app text-text-primary antialiased`}
      >
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
