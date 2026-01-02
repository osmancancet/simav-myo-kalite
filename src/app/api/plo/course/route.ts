import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// POST - Ders-PLO eşleştirmesi kaydet
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { courses: true }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const body = await req.json()
        const { courseId, ploId, level } = body

        if (!courseId || !ploId || !level) {
            return NextResponse.json({ error: "Eksik alan" }, { status: 400 })
        }

        // Yetki kontrolü
        const isOwner = user.courses.some(c => c.id === courseId)
        const isAdmin = user.role === "MUDUR" || user.role === "MUDUR_YRD"

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 })
        }

        const coursePLO = await prisma.coursePLO.upsert({
            where: {
                courseId_ploId: { courseId, ploId }
            },
            update: { level },
            create: { courseId, ploId, level }
        })

        return NextResponse.json(coursePLO)
    } catch (error) {
        console.error("Error saving course PLO:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE - Ders-PLO eşleştirmesi sil
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const courseId = searchParams.get("courseId")
        const ploId = searchParams.get("ploId")

        if (!courseId || !ploId) {
            return NextResponse.json({ error: "Course ID ve PLO ID gerekli" }, { status: 400 })
        }

        await prisma.coursePLO.delete({
            where: {
                courseId_ploId: { courseId, ploId }
            }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting course PLO:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
