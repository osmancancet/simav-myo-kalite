import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { isAdminRole } from "@/lib/roles"
import JSZip from "jszip"
import fs from "fs"
import path from "path"

export const dynamic = "force-dynamic"
export const runtime = "nodejs"

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
    const semesterId = searchParams.get("semesterId")

    if (!semesterId) {
        return NextResponse.json({ error: "Semester ID required" }, { status: 400 })
    }

    // Get semester with all courses and files
    const semester = await prisma.semester.findUnique({
        where: { id: semesterId },
        include: {
            courses: {
                include: {
                    instructor: {
                        select: { name: true, email: true }
                    },
                    exams: {
                        include: {
                            files: true
                        }
                    }
                }
            }
        }
    })

    if (!semester) {
        return NextResponse.json({ error: "Semester not found" }, { status: 404 })
    }

    // Create ZIP archive
    const zip = new JSZip()

    // Add README
    const readme = `# Arşiv - ${semester.name}

Bu arşiv, ${semester.name} dönemine ait tüm sınav dosyalarını içermektedir.

## Oluşturulma Tarihi
${new Date().toLocaleString("tr-TR")}

## İçerik
${semester.courses.map(c => `- ${c.code}: ${c.name} (${c.exams.length} sınav, ${c.exams.reduce((acc, e) => acc + e.files.length, 0)} dosya)`).join('\n')}
`
    zip.file("README.txt", readme)

    // Process each course
    for (const course of semester.courses) {
        if (course.exams.length === 0) continue

        const courseFolder = zip.folder(`${course.code} - ${course.name}`)
        if (!courseFolder) continue

        // Add course info
        const courseInfo = `Ders: ${course.code} - ${course.name}
Eğitmen: ${course.instructor.name || course.instructor.email}
Dönem: ${semester.name}
Sınav Sayısı: ${course.exams.length}
Dosya Sayısı: ${course.exams.reduce((acc, e) => acc + e.files.length, 0)}
`
        courseFolder.file("ders-bilgisi.txt", courseInfo)

        // Process each exam
        for (const exam of course.exams) {
            if (exam.files.length === 0) continue

            const examFolder = courseFolder.folder(exam.name)
            if (!examFolder) continue

            // Add files
            for (const file of exam.files) {
                try {
                    const filePath = path.join(process.cwd(), file.path)
                    if (fs.existsSync(filePath)) {
                        const fileContent = fs.readFileSync(filePath)
                        const typeLabel = file.type === "BEST" ? "En_Iyi" : file.type === "AVERAGE" ? "Orta" : "En_Dusuk"
                        examFolder.file(`${typeLabel}_${file.filename}`, fileContent)
                    }
                } catch (error) {
                    console.error(`Error adding file ${file.filename}:`, error)
                }
            }
        }
    }

    // Generate ZIP
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" })

    return new NextResponse(zipBuffer, {
        headers: {
            "Content-Type": "application/zip",
            "Content-Disposition": `attachment; filename="arsiv-${semester.name.replace(/\s+/g, '-')}.zip"`
        }
    })
}
