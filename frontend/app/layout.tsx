import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "react-hot-toast";

export const metadata: Metadata = {
  title: "Pocket Brain — Your AI Money OS",
  description:
    "AI-powered personal finance dashboard. Track spending, plan goals, simulate decisions, and get insights.",
  keywords: ["finance", "budget", "savings", "AI", "personal finance"],
  authors: [{ name: "Akul Ramesh" }],
  openGraph: {
    title: "Pocket Brain",
    description: "Your AI-powered money operating system.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#0d1f38",
              color: "#e2e8f0",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "12px",
              fontSize: "14px",
            },
            success: { iconTheme: { primary: "#22c55e", secondary: "#040d1a" } },
            error: { iconTheme: { primary: "#ef4444", secondary: "#040d1a" } },
          }}
        />
      </body>
    </html>
  );
}
