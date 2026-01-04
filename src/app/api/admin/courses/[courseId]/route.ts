import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = {
    params: Promise<{ courseId: string }>
}

// DELETE - Remove course
export async function DELETE(req: NextRequest, { params }: Params) {
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

    const { courseId } = await params

    try {
        // Get all exams for this course
        const exams = await prisma.exam.findMany({
            where: { courseId },
            include: { files: true }
        })

        // Delete delete requests for all files in exams
        for (const exam of exams) {
            for (const file of exam.files) {
                await prisma.deleteRequest.deleteMany({
                    where: { fileId: file.id }
                })
            }
        }

        // Delete the course (cascade will delete exams and files)
        await prisma.course.delete({ where: { id: courseId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}

