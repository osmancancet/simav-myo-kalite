import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/roles"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
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

    const { searchParams } = new URL(req.url)
    const type = searchParams.get("type") || "summary"

    const courses = await prisma.course.findMany({
        include: {
            instructor: { select: { name: true, email: true } },
            exams: { include: { files: true } }
        }
    })

    const users = await prisma.user.findMany({
        select: { id: true, name: true, email: true, role: true }
    })

    const totalExams = courses.reduce((acc, c) => acc + c.exams.length, 0)
    const totalFiles = courses.reduce((acc, c) => acc + c.exams.reduce((a, e) => a + e.files.length, 0), 0)
    const completedExams = courses.reduce((acc, c) => acc + c.exams.filter(e => e.files.length >= 3).length, 0)

    if (type === "excel") {
        const data = {
            summary: {
                totalCourses: courses.length,
                totalExams,
                totalFiles,
                completedExams,
                completionRate: totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0,
                totalUsers: users.length
            },
            courses: courses.map(c => ({
                code: c.code,
                name: c.name,
                instructor: c.instructor.name || c.instructor.email,
                examCount: c.exams.length,
                fileCount: c.exams.reduce((a, e) => a + e.files.length, 0),
                completedExams: c.exams.filter(e => e.files.length >= 3).length
            })),
            users: users.map(u => ({
                name: u.name,
                email: u.email,
                role: u.role
            }))
        }
        return NextResponse.json(data)
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Simav MYO Kalite Raporu</title>
    <style>
        body { font-family: Arial, sans-serif; padding: 40px; }
        h1 { color: #1e293b; border-bottom: 2px solid #3b82f6; padding-bottom: 10px; }
        h2 { color: #334155; margin-top: 30px; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
        th { background: #3b82f6; color: white; }
        tr:nth-child(even) { background: #f8fafc; }
        .stat { display: inline-block; padding: 20px; margin: 10px; background: #f1f5f9; border-radius: 8px; }
        .stat-value { font-size: 32px; font-weight: bold; color: #3b82f6; }
        .stat-label { color: #64748b; }
    </style>
</head>
<body>
    <h1>Simav MYO Kalite Yönetim Sistemi Raporu</h1>
    <p>Oluşturulma Tarihi: ${new Date().toLocaleString("tr-TR")}</p>
    
    <div>
        <div class="stat">
            <div class="stat-value">${courses.length}</div>
            <div class="stat-label">Toplam Ders</div>
        </div>
        <div class="stat">
            <div class="stat-value">${totalExams}</div>
            <div class="stat-label">Toplam Sınav</div>
        </div>
        <div class="stat">
            <div class="stat-value">${totalFiles}</div>
            <div class="stat-label">Toplam Dosya</div>
        </div>
        <div class="stat">
            <div class="stat-value">%${totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0}</div>
            <div class="stat-label">Tamamlanma</div>
        </div>
    </div>

    <h2>Ders Listesi</h2>
    <table>
        <tr>
            <th>Ders Kodu</th>
            <th>Ders Adı</th>
            <th>Eğitmen</th>
            <th>Sınav</th>
            <th>Dosya</th>
            <th>Tamamlanan</th>
        </tr>
        ${courses.map(c => `
        <tr>
            <td>${c.code}</td>
            <td>${c.name}</td>
            <td>${c.instructor.name || c.instructor.email}</td>
            <td>${c.exams.length}</td>
            <td>${c.exams.reduce((a, e) => a + e.files.length, 0)}</td>
            <td>${c.exams.filter(e => e.files.length >= 3).length}</td>
        </tr>
        `).join('')}
    </table>
</body>
</html>
    `

    return new NextResponse(htmlContent, {
        headers: {
            "Content-Type": "text/html; charset=utf-8"
        }
    })
}
