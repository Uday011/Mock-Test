import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Nalanda — Integrated Learning, Testing & Academic Knowledge Platform',
  description: 'A modern, structured education platform integrating syllabus-driven learning paths, computer-based mock exams, readiness diagnostics, and educator test publishing.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen text-[#202124] antialiased selection:bg-[#cce2ff] selection:text-[#183b56]">
        <Navbar />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
