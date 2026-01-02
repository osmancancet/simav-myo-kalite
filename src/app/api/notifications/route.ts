import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - Kullanıcının bildirimlerini getir
export async function GET(req: NextRequest) {
    try {
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

        const { searchParams } = new URL(req.url)
        const unreadOnly = searchParams.get("unread") === "true"
        const limit = parseInt(searchParams.get("limit") || "20")

        const notifications = await prisma.notification.findMany({
            where: {
                userId: user.id,
                ...(unreadOnly ? { read: false } : {})
            },
            orderBy: { createdAt: "desc" },
            take: limit
        })

        const unreadCount = await prisma.notification.count({
            where: { userId: user.id, read: false }
        })

        return NextResponse.json({ notifications, unreadCount })
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST - Yeni bildirim oluştur (admin/sistem için)
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await req.json()
        const { userId, title, message, type = "INFO", link } = body

        if (!userId || !title || !message) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
        }

        const notification = await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                link
            }
        })

        return NextResponse.json(notification, { status: 201 })
    } catch (error) {
        console.error("Error creating notification:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// PATCH - Bildirimleri okundu olarak işaretle
export async function PATCH(req: NextRequest) {
    try {
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

        const body = await req.json()
        const { notificationIds, markAll } = body

        if (markAll) {
            await prisma.notification.updateMany({
                where: { userId: user.id, read: false },
                data: { read: true }
            })
        } else if (notificationIds?.length) {
            await prisma.notification.updateMany({
                where: {
                    id: { in: notificationIds },
                    userId: user.id
                },
                data: { read: true }
            })
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error marking notifications as read:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
