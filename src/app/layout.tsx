import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/contexts/AuthContext";
import { Navigation } from "@/components/Navigation";
import { GoogleAuthHandler } from "@/components/GoogleAuthHandler";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Budget Nest - Smart Expense Tracking",
  description: "Track your expenses, set savings goals, and achieve financial freedom with Budget Nest. A modern expense tracking application.",
  keywords: ["Budget Nest", "expense tracking", "budget management", "savings goals", "finance", "personal finance"],
  authors: [{ name: "Budget Nest Team" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "Budget Nest - Smart Expense Tracking",
    description: "Track your expenses, set savings goals, and achieve financial freedom",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Budget Nest - Smart Expense Tracking",
    description: "Track your expenses, set savings goals, and achieve financial freedom",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body
        className={`${inter.variable} antialiased bg-background text-foreground min-h-screen flex flex-col font-sans`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GoogleAuthHandler />
            <Navigation />
            <main className="flex-1 w-full">{children}</main>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
