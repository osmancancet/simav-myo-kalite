import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

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
                    exams: {
                        include: { files: true }
                    }
                }
            }
        }
    })

    if (!user) {
        return NextResponse.json([])
    }

    const reminders: Array<{
        id: string
        type: "missing_files" | "incomplete_exam" | "upcoming_deadline"
        title: string
        message: string
        priority: "high" | "medium" | "low"
        courseId?: string
        examId?: string
    }> = []

    for (const course of user.courses) {
        for (const exam of course.exams) {
            const fileCount = exam.files.length

            if (fileCount === 0) {
                reminders.push({
                    id: `missing_${exam.id}`,
                    type: "missing_files",
                    title: "Dosya yüklenmemiş",
                    message: `${course.code} - ${exam.name} için henüz dosya yüklenmemiş`,
                    priority: "high",
                    courseId: course.id,
                    examId: exam.id
                })
            } else if (fileCount < 3) {
                const missingTypes: string[] = []
                if (!exam.files.find(f => f.type === "BEST")) missingTypes.push("En İyi")
                if (!exam.files.find(f => f.type === "AVERAGE")) missingTypes.push("Orta")
                if (!exam.files.find(f => f.type === "WORST")) missingTypes.push("En Düşük")

                if (missingTypes.length > 0) {
                    reminders.push({
                        id: `incomplete_${exam.id}`,
                        type: "incomplete_exam",
                        title: "Eksik dosya",
                        message: `${course.code} - ${exam.name}: ${missingTypes.join(", ")} dosyası eksik`,
                        priority: "medium",
                        courseId: course.id,
                        examId: exam.id
                    })
                }
            }
        }

        if (course.exams.length === 0) {
            reminders.push({
                id: `no_exam_${course.id}`,
                type: "incomplete_exam",
                title: "Sınav eklenmemiş",
                message: `${course.code} - ${course.name} için sınav eklenmemiş`,
                priority: "low",
                courseId: course.id
            })
        }
    }

    reminders.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 }
        return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    return NextResponse.json(reminders)
}
