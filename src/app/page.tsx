import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { isAdminRole } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function HomePage() {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/login")
    }

    // Get user with role
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        redirect("/login")
    }

    // Redirect based on role
    if (isAdminRole(user.role)) {
        redirect("/admin")
    } else {
        redirect("/hoca")
    }
}
