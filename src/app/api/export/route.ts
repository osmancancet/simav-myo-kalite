import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { isAdminRole } from "@/lib/roles"
import fs from "fs"
import path from "path"
import JSZip from "jszip"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { courseIds, semesterId } = await req.json()

    // Build query based on user role and filters
    let whereClause: any = {}

    if (!isAdminRole(user.role)) {
        whereClause.instructorId = user.id
    }

    if (courseIds && courseIds.length > 0) {
        whereClause.id = { in: courseIds }
    }

    if (semesterId) {
        whereClause.semesterId = semesterId
    }

    const courses = await prisma.course.findMany({
        where: whereClause,
        include: {
            instructor: true,
            semester: true,
            exams: {
                include: { files: true }
            }
        }
    })

    if (courses.length === 0) {
        return NextResponse.json({ error: "No courses found" }, { status: 404 })
    }

    // Create ZIP file
    const zip = new JSZip()

    for (const course of courses) {
        const semesterFolder = course.semester?.name || "Donemsiz"
        const courseFolder = `${semesterFolder}/${course.code} - ${course.name}`

        for (const exam of course.exams) {
            const examFolder = `${courseFolder}/${exam.name}`

            for (const file of exam.files) {
                const filePath = path.join(process.cwd(), file.path)

                if (fs.existsSync(filePath)) {
                    const fileContent = fs.readFileSync(filePath)
                    const typeLabel = file.type === "BEST" ? "En_Iyi" :
                        file.type === "AVERAGE" ? "Orta" : "En_Dusuk"
                    const fileName = `${typeLabel}_${file.filename}`
                    zip.file(`${examFolder}/${fileName}`, fileContent)
                }
            }
        }
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    // Generate filename
    const timestamp = new Date().toISOString().slice(0, 10)
    const fileName = `MYO_Arsiv_${timestamp}.zip`

    return new NextResponse(zipBuffer, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="${fileName}"`,
        }
    })
}
