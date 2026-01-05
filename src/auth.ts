import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"

// Admin roles that have full admin access
const ADMIN_ROLES = ["MUDUR", "MUDUR_YRD"]

// Allowed email domain and specific test emails
const ALLOWED_DOMAIN = "@dpu.edu.tr"
const TEST_EMAILS = ["oskitocan55@gmail.com"]

export const { handlers, auth, signIn, signOut } = NextAuth({
    session: {
        strategy: "jwt",
    },
    providers: [
        Google({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ user }) {
            console.log("=== SIGN IN ATTEMPT ===")
            console.log("Email:", user.email)

            if (!user.email) {
                console.log("No email - rejected")
                return false
            }

            // Check if email is allowed
            const isAllowedDomain = user.email.endsWith(ALLOWED_DOMAIN)
            const isTestEmail = TEST_EMAILS.includes(user.email)

            console.log("Is DPU domain:", isAllowedDomain)
            console.log("Is test email:", isTestEmail)

            if (!isAllowedDomain && !isTestEmail) {
                console.log("Not allowed domain or test email - rejected")
                return false
            }

            // Check if user exists in database
            const dbUser = await prisma.user.findUnique({
                where: { email: user.email }
            })

            console.log("DB User exists:", !!dbUser)

            // If user doesn't exist, auto-create for allowed emails
            if (!dbUser) {
                // Auto-create main admin
                if (user.email === "osman.cetlenbik@dpu.edu.tr") {
                    console.log("Creating admin user")
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "Müdür",
                            role: "MUDUR"
                        }
                    })
                    return true
                }

                // Auto-create test hoca
                if (user.email === "oskitocan55@gmail.com") {
                    console.log("Creating test hoca user")
                    await prisma.user.create({
                        data: {
                            email: user.email,
                            name: user.name || "Test Hoca",
                            role: "HOCA"
                        }
                    })
                    return true
                }

                console.log("User not in DB and not auto-create email - rejected")
                // Other users must be added by admin first
                return false
            }

            // Log successful login
            try {
                await prisma.activityLog.create({
                    data: {
                        userId: dbUser.id,
                        action: 'LOGIN',
                        entityType: 'USER',
                        entityId: dbUser.id,
                        details: user.name || user.email || ''
                    }
                })
            } catch (err) {
                console.error("Login activity log error:", err)
            }

            console.log("User exists - allowed")
            return true
        },
        async jwt({ token, user }) {
            if (user?.email) {
                const dbUser = await prisma.user.findUnique({
                    where: { email: user.email }
                })
                token.role = dbUser?.role || "HOCA"
                token.dbId = dbUser?.id
            }
            return token
        },
        async session({ session, token }) {
            if (session.user && token) {
                session.user.role = token.role as string
                session.user.id = token.dbId as string
            }
            return session
        },
    },
    pages: {
        signIn: "/login",
        error: "/login",
    },
})

// Helper function to check if user has admin privileges
export function isAdminRole(role: string): boolean {
    return ADMIN_ROLES.includes(role)
}
