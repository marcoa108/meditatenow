// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: { strategy: 'jwt' },
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
  callbacks: {
    async jwt({ token, user }) {
      // attach user id + inviteCode on sign-in
      if (user) {
        token.id = (user as any).id
        token.inviteCode = (user as any).inviteCode ?? null
      } else if (token?.email) {
        // keep inviteCode fresh across requests
        const dbUser = await prisma.user.findUnique({ where: { email: token.email as string } })
        token.inviteCode = dbUser?.inviteCode ?? null
      }
      return token
    },
    async session({ session, token }) {
      // expose on session for client checks
      ;(session as any).userId = token.id
      ;(session as any).inviteCode = (token as any).inviteCode ?? null
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
