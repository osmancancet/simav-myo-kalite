import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - Syllabus bilgisini getir
export async function GET(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const courseId = searchParams.get("courseId")

        if (!courseId) {
            return NextResponse.json({ error: "Course ID gerekli" }, { status: 400 })
        }

        const syllabus = await prisma.syllabus.findUnique({
            where: { courseId },
            include: {
                course: { select: { code: true, name: true } }
            }
        })

        return NextResponse.json(syllabus || { courseId, objectives: null, weeklyPlan: null, resources: null, evaluation: null })
    } catch (error) {
        console.error("Error fetching syllabus:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST/PUT - Syllabus kaydet veya güncelle
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
        const { courseId, objectives, weeklyPlan, resources, evaluation, fileUrl } = body

        if (!courseId) {
            return NextResponse.json({ error: "Course ID gerekli" }, { status: 400 })
        }

        // Kullanıcı bu dersin sahibi mi veya admin mi kontrol et
        const isOwner = user.courses.some(c => c.id === courseId)
        const isAdmin = user.role === "MUDUR" || user.role === "MUDUR_YRD"

        if (!isOwner && !isAdmin) {
            return NextResponse.json({ error: "Bu ders için yetkiniz yok" }, { status: 403 })
        }

        const syllabus = await prisma.syllabus.upsert({
            where: { courseId },
            update: {
                objectives: objectives ? JSON.stringify(objectives) : null,
                weeklyPlan: weeklyPlan ? JSON.stringify(weeklyPlan) : null,
                resources: resources ? JSON.stringify(resources) : null,
                evaluation: evaluation ? JSON.stringify(evaluation) : null,
                fileUrl
            },
            create: {
                courseId,
                objectives: objectives ? JSON.stringify(objectives) : null,
                weeklyPlan: weeklyPlan ? JSON.stringify(weeklyPlan) : null,
                resources: resources ? JSON.stringify(resources) : null,
                evaluation: evaluation ? JSON.stringify(evaluation) : null,
                fileUrl
            }
        })

        return NextResponse.json(syllabus)
    } catch (error) {
        console.error("Error saving syllabus:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
