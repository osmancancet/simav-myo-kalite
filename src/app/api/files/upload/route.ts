import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Dynamic imports
    const { prisma } = await import("@/lib/prisma")
    const { saveFile } = await import("@/lib/file-storage")
    const { isAdminRole } = await import("@/lib/roles")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string
    const examId = formData.get("examId") as string
    const gradeStr = formData.get("grade") as string
    const grade = gradeStr ? parseInt(gradeStr) : null

    if (!file || !type || !examId) {
        return NextResponse.json({ error: "Dosya, tür ve sınav gerekli" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Sadece PDF dosyaları yüklenebilir" }, { status: 400 })
    }

    // Check file size (max 10MB)
    const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: "Dosya boyutu 10MB'dan küçük olmalıdır" }, { status: 400 })
    }

    if (!["BEST", "AVERAGE", "WORST"].includes(type)) {
        return NextResponse.json({ error: "Geçersiz dosya türü" }, { status: 400 })
    }

    // Validate grade if provided
    if (grade !== null && (grade < 0 || grade > 100)) {
        return NextResponse.json({ error: "Not 0-100 arasında olmalıdır" }, { status: 400 })
    }

    // Get exam and verify ownership
    const exam = await prisma.exam.findUnique({
        where: { id: examId },
        include: {
            course: { include: { instructor: true } },
            files: true
        }
    })

    if (!exam) {
        return NextResponse.json({ error: "Sınav bulunamadı" }, { status: 404 })
    }

    const isOwner = exam.course.instructor.email === session.user.email
    const isAdmin = isAdminRole(user.role)

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Bu sınava dosya yükleme yetkiniz yok" }, { status: 403 })
    }

    // Check if file type already exists for this exam
    const existingFile = exam.files.find(f => f.type === type)
    if (existingFile) {
        return NextResponse.json({ error: `Bu sınav için ${type === "BEST" ? "En İyi" : type === "AVERAGE" ? "Orta" : "En Düşük"} dosya zaten yüklenmiş` }, { status: 409 })
    }

    try {
        const filePath = await saveFile(file, exam.course.code)

        const examFile = await prisma.examFile.create({
            data: {
                type,
                filename: file.name,
                path: filePath,
                grade,
                examId
            }
        })

        // Log the upload activity
        try {
            await prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: 'UPLOAD',
                    entityType: 'FILE',
                    entityId: examFile.id,
                    details: `${file.name} - ${exam.course.code} - ${exam.name}`
                }
            })
        } catch (logErr) {
            console.error("Activity log error:", logErr)
        }

        return NextResponse.json({ success: true, file: examFile })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Yükleme başarısız" }, { status: 500 })
    }
}
