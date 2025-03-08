import Header from "@/components/header";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/utilities/providers";
import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import localFont from "next/font/local";
import { Suspense } from "react";
import "./globals.css";
import { createProfileAction, getProfileByUserIdAction } from "@/actions/profiles-actions";
import { auth } from "@clerk/nextjs/server";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900"
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900"
});

export const metadata: Metadata = {
  title: "Ride Tracker Pro | Maximize Your Rideshare Earnings",
  description: "The complete solution for rideshare drivers to track earnings, expenses, and optimize performance.",
  keywords: "rideshare, uber, lyft, driver app, earnings tracker, expense tracker, tax deductions",
  authors: [{ name: "Ride Tracker Pro Team" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://ride-tracker-pro.vercel.app'),
  openGraph: {
    title: "Ride Tracker Pro | Maximize Your Rideshare Earnings",
    description: "The complete solution for rideshare drivers to track earnings, expenses, and optimize performance.",
    url: "https://ridetrackerpro.com",
    siteName: "Ride Tracker Pro",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Ride Tracker Pro"
      }
    ],
    locale: "en_US",
    type: "website"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId } = await auth();
  if (userId) {
    const profile = await getProfileByUserIdAction(userId);
    if (!profile.data) {
      await createProfileAction({ userId });
    }
  }

  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}>
          <Providers
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <Suspense fallback={<div className="h-16 border-b border-border bg-background/95 backdrop-blur"></div>}>
              <Header />
            </Suspense>
            <main className="flex-1">{children}</main>
            <footer className="py-6 border-t border-border bg-muted/30">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center">
                  <div className="flex items-center space-x-2 mb-4 md:mb-0">
                    <span className="text-sm text-muted-foreground">© {new Date().getFullYear()} Ride Tracker Pro. All rights reserved.</span>
                  </div>
                  <div className="flex space-x-6">
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy Policy</a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms of Service</a>
                    <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Contact</a>
                  </div>
                </div>
              </div>
            </footer>
            <Suspense fallback={null}>
              <Toaster />
            </Suspense>
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}