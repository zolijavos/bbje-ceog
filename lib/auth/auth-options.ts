import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/db/prisma';
import bcrypt from 'bcryptjs';
import { logError } from '@/lib/utils/logger';
import { checkRateLimit, resetRateLimit, RATE_LIMITS } from '@/lib/services/rate-limit';
import { getFullName } from '@/lib/utils/name';

export const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email.toLowerCase().trim();
        const rateLimitKey = `auth:${email}`;

        // Check rate limiting (DB-based)
        const rateLimitResult = await checkRateLimit(rateLimitKey, RATE_LIMITS.AUTH);
        if (!rateLimitResult.allowed) {
          throw new Error('Too many login attempts');
        }

        try {
          // Find user in database
          const user = await prisma.user.findUnique({
            where: { email }
          });

          if (!user) {
            return null;
          }

          // Verify password with bcrypt
          const isValidPassword = await bcrypt.compare(credentials.password, user.password_hash);

          if (!isValidPassword) {
            return null;
          }

          // Clear failed attempts on successful login
          await resetRateLimit(rateLimitKey);

          // Return user object (will be passed to JWT callback)
          return {
            id: user.id.toString(),
            email: user.email,
            name: getFullName(user.first_name, user.last_name),
            role: user.role
          };
        } catch (error) {
          logError('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: 'jwt',
    maxAge: 24 * 60 * 60 // 24 hours
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in, add user info to token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      // Add user info from token to session
      if (session.user) {
        session.user.id = parseInt(token.id as string);
        session.user.role = token.role as any;
        session.user.name = token.name as string;
      }
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
