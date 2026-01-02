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

    if (!adminUser || adminUser.role !== "ADMIN") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { courseId } = await params

    try {
        // Delete delete requests associated with files in this course
        await prisma.deleteRequest.deleteMany({
            where: {
                file: {
                    courseId: courseId
                }
            }
        })

        // Delete all files in this course
        await prisma.archiveFile.deleteMany({
            where: { courseId }
        })

        // Delete the course
        await prisma.course.delete({ where: { id: courseId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
