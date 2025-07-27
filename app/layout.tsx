import '@fontsource/fira-mono/400.css';  // Import regular weight
import '@fontsource/fira-mono/700.css';  // Optional bold weight

import type { Metadata } from "next";
import "./globals.css";
import { checkDatabaseConnection } from "@/lib/db";


export const metadata: Metadata = {
  title: "CodeZenKai - Competitive Programming Platform",
  description: "Proctored coding contests for friends and small groups",
};

if (typeof window === 'undefined') {
  checkDatabaseConnection().then(connected => {
    if (connected) {
      console.log('🟢 Database connection established');
    } else {
      console.log('🔴 Database connection failed');
    }
  });
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-mono antialiased bg-vscode-bg text-vscode-text">
        {children}
      </body>
    </html>
  );
}
