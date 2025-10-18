import './globals.css';
import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { NextIntlClientProvider } from 'next-intl';
import en from '@/messages/en.json';
import it from '@/messages/it.json';

export const metadata: Metadata = {
  title: 'MeditateNow',
  description: 'Sahaja Yoga meditation app',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = cookies();
  const locale = cookieStore.get('locale')?.value ?? 'en';
  const messagesMap: Record<string, any> = { en, it };
  const messages = messagesMap[locale] ?? en;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <main className="min-h-screen max-w-4xl mx-auto p-4">{children}</main>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

