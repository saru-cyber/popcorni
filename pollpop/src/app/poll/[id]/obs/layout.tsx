import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PollPop OBS Overlay",
  robots: { index: false, follow: false },
};

/** Transparent browser source for OBS — no chrome, no solid bg */
export default function ObsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
