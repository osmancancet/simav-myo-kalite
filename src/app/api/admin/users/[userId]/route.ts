import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = {
    params: Promise<{ userId: string }>
}

// DELETE - Remove user
export async function DELETE(req: NextRequest, { params }: Params) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if admin
    const adminUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!adminUser || !isAdminRole(adminUser.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { userId } = await params

    // Prevent deleting the main admin
    const userToDelete = await prisma.user.findUnique({
        where: { id: userId },
        include: { courses: true }
    })

    if (!userToDelete) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    if (userToDelete.email === "osman.cetlenbik@dpu.edu.tr") {
        return NextResponse.json({ error: "Cannot delete main admin" }, { status: 403 })
    }

    try {
        // First delete all courses associated with this user
        if (userToDelete.courses.length > 0) {
            // Delete any archive files and delete requests associated with courses
            for (const course of userToDelete.courses) {
                // Delete delete requests
                await prisma.deleteRequest.deleteMany({
                    where: {
                        file: {
                            courseId: course.id
                        }
                    }
                })
                // Delete archive files
                await prisma.archiveFile.deleteMany({
                    where: { courseId: course.id }
                })
            }
            // Delete courses
            await prisma.course.deleteMany({
                where: { instructorId: userId }
            })
        }

        // Delete any delete requests made by this user
        await prisma.deleteRequest.deleteMany({
            where: { requesterId: userId }
        })

        // Now delete the user
        await prisma.user.delete({ where: { id: userId } })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Delete error:", error)
        return NextResponse.json({ error: "Delete failed" }, { status: 500 })
    }
}
