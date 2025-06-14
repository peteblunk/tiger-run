import type {Metadata} from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster for potential future use

export const metadata: Metadata = {
  title: 'Tiger Run Game',
  description: 'A fun Pac-Man like game with a chomping tiger!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-headline antialiased dark"> {/* Ensure dark theme is applied by default and Space Grotesk */}
        {children}
        <Toaster /> {/* For potential error messages or notifications */}
      </body>
    </html>
  );
}
