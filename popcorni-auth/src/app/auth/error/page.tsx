import type { Metadata } from "next";
import { AuthErrorPanel } from "@/app/auth/error/AuthErrorPanel";
import { PAGE_COPY } from "@/config/constants";

export const metadata: Metadata = {
  title: PAGE_COPY.errorTitle,
};

export default function AuthErrorPage() {
  return <AuthErrorPanel />;
}
