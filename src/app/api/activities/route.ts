import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/roles"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

export async function GET(req: Request) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const action = searchParams.get("action")
    const userId = searchParams.get("userId")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Record<string, string> = {}
    if (action) where.action = action
    if (userId) where.userId = userId

    const activities = await prisma.activityLog.findMany({
        where,
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: limit
    })

    return NextResponse.json(activities)
}

export async function POST(req: Request) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { action, entityType, entityId, details } = await req.json()

    const activity = await prisma.activityLog.create({
        data: {
            userId: user.id,
            action,
            entityType,
            entityId,
            details
        }
    })

    return NextResponse.json(activity, { status: 201 })
}
