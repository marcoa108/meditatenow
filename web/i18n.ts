import {getRequestConfig} from 'next-intl/server'
import en from './messages/en.json'

export const locales = ['en', 'it'] as const
export type Locale = typeof locales[number]

// Minimal static config to satisfy next-intl runtime; actual locale/messages
// are provided via NextIntlClientProvider in app/layout.tsx
export default getRequestConfig(() => ({
  locale: 'en',
  messages: en as any,
}))
