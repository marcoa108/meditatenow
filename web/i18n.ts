import {getRequestConfig} from 'next-intl/server'

export const locales = ['en', 'it'] as const
export type Locale = typeof locales[number]

export default getRequestConfig(async ({locale}) => ({
  locale,
  messages: (await import(`./messages/${locale}.json`).catch(() => import('./messages/en.json'))).default
}))
