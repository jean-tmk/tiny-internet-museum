import type { Metadata } from "next";
import "./globals.css";
import "./interactions.css";

export const metadata: Metadata = {
  title: "The Tiny Internet Museum",
  description: "Seven small artifacts from the handmade web, preserved badly and with affection.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
