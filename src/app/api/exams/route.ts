import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST - Add new exam to a course
export async function POST(req: NextRequest) {
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

    const { courseId, name, semester } = await req.json()

    if (!courseId || !name) {
        return NextResponse.json({ error: "Ders ve sınav adı gereklidir" }, { status: 400 })
    }

    // Verify course ownership or admin
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: true }
    })

    if (!course) {
        return NextResponse.json({ error: "Ders bulunamadı" }, { status: 404 })
    }

    const isOwner = course.instructor.email === session.user.email
    const isAdmin = isAdminRole(user.role)

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Bu derse sınav ekleme yetkiniz yok" }, { status: 403 })
    }

    // Check if exam already exists for this course
    const existingExam = await prisma.exam.findFirst({
        where: {
            courseId,
            name,
            semester: semester || null
        }
    })

    if (existingExam) {
        return NextResponse.json({ error: "Bu sınav zaten mevcut" }, { status: 409 })
    }

    const exam = await prisma.exam.create({
        data: {
            name,
            semester: semester || null,
            courseId
        }
    })

    return NextResponse.json(exam)
}
