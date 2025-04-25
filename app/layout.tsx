import { auth } from "@/auth";
import { SessionProvider } from "next-auth/react";
import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Next PWA with Serwist Example",
  description: "An example of how to use Serwist in Next.js"
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  return (
    <SessionProvider session={session}>
      <html lang="en">
        <body className="antialiased">{children}</body>
      </html>
    </SessionProvider>
  );
}
