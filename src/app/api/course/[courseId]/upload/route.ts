import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Custom route params type
type Params = {
    params: Promise<{
        courseId: string
    }>
}

export async function POST(req: NextRequest, { params }: Params) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { courseId } = await params

    // Dynamic imports to avoid Edge runtime issues during build
    const { prisma } = await import("@/lib/prisma")
    const { saveFile } = await import("@/lib/file-storage")
    const { isAdminRole } = await import("@/lib/roles")

    // Get user
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    // Verify instructor ownership
    const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { instructor: true }
    })

    if (!course) return NextResponse.json({ error: "Course not found" }, { status: 404 })

    // Check if session user matches instructor email or is admin
    if (course.instructor.email !== session.user.email && (!user || !isAdminRole(user.role))) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get("file") as File
    const type = formData.get("type") as string // BEST, AVERAGE, WORST

    if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    if (file.type !== "application/pdf") {
        return NextResponse.json({ error: "Only PDF files are allowed" }, { status: 400 })
    }

    if (!["BEST", "AVERAGE", "WORST"].includes(type)) {
        return NextResponse.json({ error: "Invalid paper type" }, { status: 400 })
    }

    try {
        const filePath = await saveFile(file, course.code) // Store by course code

        const archiveFile = await prisma.archiveFile.create({
            data: {
                filename: file.name,
                path: filePath,
                type: type,
                courseId: course.id,
            }
        })

        return NextResponse.json({ success: true, file: archiveFile })
    } catch (error) {
        console.error("Upload error:", error)
        return NextResponse.json({ error: "Upload failed" }, { status: 500 })
    }
}
