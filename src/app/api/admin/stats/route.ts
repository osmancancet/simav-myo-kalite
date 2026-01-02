import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET() {
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

        // Temel istatistikler
        const [userCount, courseCount, examCount, fileCount] = await Promise.all([
            prisma.user.count(),
            prisma.course.count(),
            prisma.exam.count(),
            prisma.examFile.count()
        ])

        // Kullanıcılar role göre
        const users = await prisma.user.groupBy({
            by: ["role"],
            _count: { role: true }
        })
        const usersByRole = users.map(u => ({ role: u.role, count: u._count.role }))

        // Dosyalar türe göre
        const files = await prisma.examFile.groupBy({
            by: ["type"],
            _count: { type: true }
        })
        const filesByType = files.map(f => ({ type: f.type, count: f._count.type }))

        // Tamamlanan sınavlar (3 dosyası olan)
        const examsWithFiles = await prisma.exam.findMany({
            include: { _count: { select: { files: true } } }
        })
        const completedExams = examsWithFiles.filter(e => e._count.files >= 3).length

        // Son 6 ay yüklemeler
        const sixMonthsAgo = new Date()
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

        const recentFiles = await prisma.examFile.findMany({
            where: { uploadedAt: { gte: sixMonthsAgo } },
            select: { uploadedAt: true }
        })

        const monthlyUploads: { month: string; count: number }[] = []
        const months = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"]

        for (let i = 5; i >= 0; i--) {
            const d = new Date()
            d.setMonth(d.getMonth() - i)
            const monthKey = `${months[d.getMonth()]} ${d.getFullYear()}`
            const count = recentFiles.filter(f => {
                const fd = new Date(f.uploadedAt)
                return fd.getMonth() === d.getMonth() && fd.getFullYear() === d.getFullYear()
            }).length
            monthlyUploads.push({ month: monthKey, count })
        }

        return NextResponse.json({
            userCount,
            courseCount,
            examCount,
            fileCount,
            completedExams,
            usersByRole,
            filesByType,
            monthlyUploads
        })
    } catch (error) {
        console.error("Error fetching stats:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
