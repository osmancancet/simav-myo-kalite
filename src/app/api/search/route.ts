import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    const session = await auth()
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const q = searchParams.get("q")?.toLowerCase() || ""

    if (q.length < 2) {
        return NextResponse.json([])
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json([])
    }

    const isAdmin = user.role === "MUDUR" || user.role === "MUDUR_YRD"

    const courses = await prisma.course.findMany({
        where: isAdmin ? {
            OR: [
                { code: { contains: q } },
                { name: { contains: q } }
            ]
        } : {
            instructorId: user.id,
            OR: [
                { code: { contains: q } },
                { name: { contains: q } }
            ]
        },
        take: 5
    })

    const exams = await prisma.exam.findMany({
        where: isAdmin ? {
            name: { contains: q }
        } : {
            course: { instructorId: user.id },
            name: { contains: q }
        },
        include: { course: true },
        take: 5
    })

    const files = await prisma.examFile.findMany({
        where: isAdmin ? {
            filename: { contains: q }
        } : {
            exam: { course: { instructorId: user.id } },
            filename: { contains: q }
        },
        include: { exam: { include: { course: true } } },
        take: 5
    })

    const results = [
        ...courses.map(c => ({
            id: c.id,
            type: "course" as const,
            title: c.code,
            subtitle: c.name,
            href: isAdmin ? `/admin/ders/${c.id}` : `/hoca/ders/${c.id}`
        })),
        ...exams.map(e => ({
            id: e.id,
            type: "exam" as const,
            title: e.name,
            subtitle: `${e.course.code} - ${e.course.name}`,
            href: isAdmin ? `/admin/ders/${e.courseId}` : `/hoca/ders/${e.courseId}`
        })),
        ...files.map(f => ({
            id: f.id,
            type: "file" as const,
            title: f.filename,
            subtitle: `${f.exam.course.code} - ${f.exam.name}`,
            href: isAdmin ? `/admin/ders/${f.exam.courseId}` : `/hoca/ders/${f.exam.courseId}`
        }))
    ]

    return NextResponse.json(results.slice(0, 10))
}
