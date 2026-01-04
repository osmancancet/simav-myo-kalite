import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET - List all courses
export async function GET() {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const courses = await prisma.course.findMany({
        include: {
            instructor: true,
            exams: { include: { files: true } },
            semester: true
        },
        orderBy: { code: "asc" }
    })

    return NextResponse.json(courses)
}

// POST - Add new course
export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!adminUser || !["MUDUR", "MUDUR_YRD"].includes(adminUser.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { code, name, instructorId } = await req.json()

    if (!code || !name || !instructorId) {
        return NextResponse.json({ error: "Code, name, and instructor required" }, { status: 400 })
    }

    // Get active semester
    const activeSemester = await prisma.semester.findFirst({
        where: { isActive: true }
    })

    if (!activeSemester) {
        return NextResponse.json({ error: "No active semester found" }, { status: 400 })
    }

    // Check if course code already exists in this semester
    const existing = await prisma.course.findUnique({
        where: {
            code_semesterId: {
                code,
                semesterId: activeSemester.id
            }
        }
    })
    if (existing) {
        return NextResponse.json({ error: "Course code already exists in this semester" }, { status: 409 })
    }

    const newCourse = await prisma.course.create({
        data: {
            code,
            name,
            instructor: { connect: { id: instructorId } },
            semester: { connect: { id: activeSemester.id } }
        }
    })

    return NextResponse.json(newCourse)
}

