import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthCallbackClient } from "@/app/auth/callback/AuthCallbackClient";
import { AUTH_COPY, PAGE_COPY } from "@/config/constants";

export const metadata: Metadata = {
  title: PAGE_COPY.callbackTitle,
};

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-16 text-center text-sm">{AUTH_COPY.restoringSession}</p>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  );
}
