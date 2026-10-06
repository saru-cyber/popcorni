import type { Metadata } from "next";
import { Suspense } from "react";
import { AUTH_COPY, PAGE_COPY } from "@/config/constants";
import { LoginEntry } from "@/app/login/LoginEntry";

export const metadata: Metadata = {
  title: PAGE_COPY.loginTitle,
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <p className="px-6 py-16 text-center text-sm">{AUTH_COPY.restoringSession}</p>
      }
    >
      <LoginEntry />
    </Suspense>
  );
}
