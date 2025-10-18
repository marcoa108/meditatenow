// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'database' },
  pages: { signIn: '/auth/signin' },
  providers: [
    EmailProvider({
      from: process.env.EMAIL_FROM ?? 'meditatenow@subtler.it',
      async sendVerificationRequest({ identifier, url }) {
        const resend = new Resend(process.env.RESEND_API_KEY)
        const { error } = await resend.emails.send({
          from: process.env.EMAIL_FROM ?? 'meditatenow@subtler.it',
          to: identifier,
          subject: 'Sign in to MeditateNow',
          text: `Sign in link: ${url}`,
          html: `<p>Click to sign in:</p><p><a href="${url}">${url}</a></p>`,
        })
        if (error) throw new Error(error.message)
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
