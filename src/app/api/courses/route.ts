import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

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

    const { code, name, instructorId, semesterId } = await req.json()

    if (!code || !name) {
        return NextResponse.json({ error: "Ders kodu ve adı gereklidir" }, { status: 400 })
    }

    // Get active semester if semesterId not provided
    let targetSemesterId = semesterId
    if (!targetSemesterId) {
        const activeSemester = await prisma.semester.findFirst({
            where: { isActive: true }
        })
        if (!activeSemester) {
            return NextResponse.json({ error: "Aktif dönem bulunamadı. Lütfen önce bir dönem oluşturun." }, { status: 400 })
        }
        targetSemesterId = activeSemester.id
    }

    // Check if course code already exists in this semester
    const existing = await prisma.course.findFirst({
        where: {
            code: code.toUpperCase(),
            semesterId: targetSemesterId
        }
    })

    if (existing) {
        return NextResponse.json({ error: "Bu ders kodu bu dönemde zaten kayıtlı" }, { status: 409 })
    }

    let targetInstructorId = user.id

    if (instructorId && isAdminRole(user.role)) {
        const targetUser = await prisma.user.findUnique({
            where: { id: instructorId }
        })
        if (targetUser) {
            targetInstructorId = instructorId
        }
    }

    const course = await prisma.course.create({
        data: {
            code: code.toUpperCase(),
            name,
            instructorId: targetInstructorId,
            semesterId: targetSemesterId
        }
    })

    return NextResponse.json(course)
}

export async function GET() {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            courses: {
                include: {
                    semester: true,
                    exams: {
                        include: { files: true }
                    }
                },
                orderBy: { code: "asc" }
            }
        }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json(user.courses)
}
