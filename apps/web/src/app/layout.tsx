import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Grat — Soroban Transaction Debugger",
  description:
    "From cryptic error to root cause in one command. Decode, trace, and debug Soroban transactions.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {/* Skip-to-content link for keyboard users */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        <div id="main-content">{children}</div>
      </body>
    </html>
  );
}
