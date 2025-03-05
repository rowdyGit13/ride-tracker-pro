"use client";

import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { useTheme } from "next-themes";
import { Suspense } from "react";

export default function LoginPage() {
  return (
    <Suspense fallback={<div>Loading sign-in...</div>}>
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const { theme } = useTheme();

  return (
    <SignIn
      forceRedirectUrl="/notes"
      appearance={{ baseTheme: theme === "dark" ? dark : undefined }}
    />
  );
}