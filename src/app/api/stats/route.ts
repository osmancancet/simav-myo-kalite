import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/roles"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
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

    // Get basic counts
    const [userCount, courseCount, examCount, fileCount] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.exam.count(),
        prisma.examFile.count()
    ])

    // Get file type distribution
    const filesByType = await prisma.examFile.groupBy({
        by: ['type'],
        _count: { type: true }
    })

    const fileTypeStats = {
        BEST: filesByType.find(f => f.type === 'BEST')?._count.type || 0,
        AVERAGE: filesByType.find(f => f.type === 'AVERAGE')?._count.type || 0,
        WORST: filesByType.find(f => f.type === 'WORST')?._count.type || 0
    }

    // Get monthly upload stats (last 6 months) - PostgreSQL compatible
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)
    let monthlyUploads: { month: string, count: number }[] = []
    try {
        const rawUploads = await prisma.$queryRaw<{ month: string, count: bigint }[]>`
            SELECT to_char("uploadedAt", 'YYYY-MM') as month, COUNT(*) as count
            FROM "ExamFile"
            WHERE "uploadedAt" >= ${sixMonthsAgo}
            GROUP BY to_char("uploadedAt", 'YYYY-MM')
            ORDER BY month ASC
        `
        monthlyUploads = rawUploads.map(r => ({ month: r.month, count: Number(r.count) }))
    } catch (e) {
        console.error("Error getting monthly uploads:", e)
    }

    // Get completion rate
    const examsWithFiles = await prisma.exam.findMany({
        include: { files: true }
    })
    const completedExams = examsWithFiles.filter(e => e.files.length >= 3).length
    const completionRate = examCount > 0 ? Math.round((completedExams / examCount) * 100) : 0

    // Get users by role
    const usersByRole = await prisma.user.groupBy({
        by: ['role'],
        _count: { role: true }
    })

    const roleStats = {
        HOCA: usersByRole.find(r => r.role === 'HOCA')?._count.role || 0,
        MUDUR: usersByRole.find(r => r.role === 'MUDUR')?._count.role || 0,
        MUDUR_YRD: usersByRole.find(r => r.role === 'MUDUR_YRD')?._count.role || 0
    }

    return NextResponse.json({
        counts: { users: userCount, courses: courseCount, exams: examCount, files: fileCount },
        fileTypeStats,
        monthlyUploads,
        roleStats,
        completionRate
    })
}

