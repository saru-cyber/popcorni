"use client";

import { AccountIntro } from "@/components/dashboard/AccountIntro";
import { AccountPitch } from "@/components/dashboard/AccountPitch";
import { AppSuite } from "@/components/dashboard/AppSuite";
import { SiteHeader } from "@/components/dashboard/SiteHeader";
import { ThemeSelect } from "@/components/dashboard/ThemeSelect";

export function PopcorniDashboard() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 sm:py-10 lg:gap-8 lg:px-8 lg:py-14">
      <SiteHeader />
      <AccountPitch />
      <AccountIntro />
      <ThemeSelect />
      <AppSuite />
    </div>
  );
}
