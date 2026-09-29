import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Team Designs | Sun Valley Scraps",
  robots: { index: false, follow: false },
};

export default function TeamLayout({ children }: LayoutProps<"/team">) {
  return <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</div>;
}
