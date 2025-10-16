import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'MeditateNow',
  description: 'Sahaja Yoga meditation app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang=\"en\">
      <body>
        <main className=\"min-h-screen max-w-4xl mx-auto p-4\">{children}</main>
      </body>
    </html>
  );
}
