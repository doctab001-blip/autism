import type { Metadata, Viewport } from "next";
import { ProfileProvider } from "@/context/ProfileContext";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HomePath Autism: Parent-Led Clinical Therapy Portal",
    template: "%s · HomePath Autism",
  },
  description:
    "Educational, evidence-informed home-therapy frameworks for autistic children, tailored to age group and DSM-5 support level. Data stays in your browser.",
  applicationName: "HomePath Autism",
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#faf7f1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-dvh antialiased">
        <ProfileProvider>{children}</ProfileProvider>
      </body>
    </html>
  );
}
