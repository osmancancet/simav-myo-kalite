import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - Takvim etkinliklerini getir
export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const startDate = searchParams.get("start")
        const endDate = searchParams.get("end")
        const courseId = searchParams.get("courseId")

        const where: Record<string, unknown> = {}

        if (startDate && endDate) {
            where.startDate = {
                gte: new Date(startDate),
                lte: new Date(endDate)
            }
        }

        if (courseId) {
            where.courseId = courseId
        }

        const events = await prisma.academicEvent.findMany({
            where,
            include: {
                course: { select: { code: true, name: true } },
                createdBy: { select: { name: true } }
            },
            orderBy: { startDate: "asc" }
        })

        return NextResponse.json(events)
    } catch (error) {
        console.error("Error fetching events:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST - Yeni etkinlik oluştur
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user || (user.role !== "MUDUR" && user.role !== "MUDUR_YRD")) {
            return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 })
        }

        const body = await req.json()
        const { title, description, type, startDate, endDate, allDay, courseId } = body

        if (!title || !type || !startDate) {
            return NextResponse.json({ error: "Eksik alan" }, { status: 400 })
        }

        const event = await prisma.academicEvent.create({
            data: {
                title,
                description,
                type,
                startDate: new Date(startDate),
                endDate: endDate ? new Date(endDate) : null,
                allDay: allDay ?? true,
                courseId: courseId || null,
                createdById: user.id
            },
            include: {
                course: { select: { code: true, name: true } },
                createdBy: { select: { name: true } }
            }
        })

        return NextResponse.json(event, { status: 201 })
    } catch (error) {
        console.error("Error creating event:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE - Etkinlik sil
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user || (user.role !== "MUDUR" && user.role !== "MUDUR_YRD")) {
            return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const eventId = searchParams.get("id")

        if (!eventId) {
            return NextResponse.json({ error: "Event ID gerekli" }, { status: 400 })
        }

        await prisma.academicEvent.delete({
            where: { id: eventId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting event:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
