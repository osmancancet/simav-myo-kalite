import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET - List all semesters
export async function GET() {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const semesters = await prisma.semester.findMany({
        include: {
            _count: {
                select: { courses: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(semesters)
}

// POST - Create new semester
export async function POST(req: NextRequest) {
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

    const { name, year, term } = await req.json()

    if (!name || !year || !term) {
        return NextResponse.json({ error: "Gerekli alanlar eksik" }, { status: 400 })
    }

    // Check if semester already exists
    const existing = await prisma.semester.findUnique({
        where: { name }
    })

    if (existing) {
        return NextResponse.json({ error: "Bu dönem zaten mevcut" }, { status: 409 })
    }

    const semester = await prisma.semester.create({
        data: {
            name,
            year,
            term,
            isActive: false
        }
    })

    // Log activity
    await prisma.activityLog.create({
        data: {
            userId: user.id,
            action: "CREATE",
            entityType: "SEMESTER",
            entityId: semester.id,
            details: name
        }
    })

    return NextResponse.json(semester, { status: 201 })
}
