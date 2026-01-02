import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole, isMudurRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET - List all users
export async function GET() {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!adminUser || !isAdminRole(adminUser.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const users = await prisma.user.findMany({
        include: { courses: true },
        orderBy: { name: "asc" }
    })

    return NextResponse.json(users)
}

// POST - Add new user (MUDUR and MUDUR_YRD)
export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Both MUDUR and MUDUR_YRD can add users
    const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!adminUser || !isAdminRole(adminUser.role)) {
        return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 })
    }

    const { email, name, role } = await req.json()

    if (!email || !name) {
        return NextResponse.json({ error: "Email and name required" }, { status: 400 })
    }

    if (!email.endsWith("@dpu.edu.tr")) {
        return NextResponse.json({ error: "Only @dpu.edu.tr emails allowed" }, { status: 400 })
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
        return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    // Validate role
    const validRoles = ["HOCA", "MUDUR", "MUDUR_YRD"]
    const userRole = validRoles.includes(role) ? role : "HOCA"

    const newUser = await prisma.user.create({
        data: {
            email,
            name,
            role: userRole
        }
    })

    return NextResponse.json(newUser)
}
