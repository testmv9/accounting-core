import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Navera - Modern Accounting for Everyone",
  description: "Navigate your finances with ease.",
};

import { auth } from "@/auth";
import Sidebar from "../components/Sidebar";
import { getUnreconciledTransactionsAction } from "../lib/actions";
import NIAIWrapper from "../components/ni/ai-wrapper";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const tenantId = (session?.user as any)?.activeTenantId;

  // Fetch unreconciled count if logged in
  let unreconciledCount = 0;
  if (tenantId) {
    const unreconciled = await getUnreconciledTransactionsAction(tenantId);
    unreconciledCount = unreconciled.length;
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  const savedTheme = localStorage.getItem('theme');
                  if (savedTheme) {
                    document.documentElement.setAttribute('data-theme', savedTheme);
                  } else {
                    document.documentElement.setAttribute('data-theme', 'dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {tenantId ? (
          <NIAIWrapper>
            <div className="app-container">
              <Sidebar unreconciledCount={unreconciledCount} />
              <main className="main-content">
                {children}
              </main>
            </div>
          </NIAIWrapper>
        ) : (
          children
        )}
      </body>
    </html>
  );
}
