import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { isAdminRole } from "@/lib/roles"
import { ArchiveClient } from "./archive-client"

export const dynamic = "force-dynamic"

export default async function ArchivePage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) redirect("/hoca")

    // Get all semesters with their stats (exclude active semester)
    const semesters = await prisma.semester.findMany({
        where: { isActive: false },
        include: {
            courses: {
                include: {
                    exams: {
                        include: {
                            files: true
                        }
                    }
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    // Format data for client
    const archiveData = semesters
        .filter(s => s.courses.length > 0) // Only show semesters with courses
        .map(semester => ({
            id: semester.id,
            name: semester.name,
            year: semester.year,
            term: semester.term,
            courseCount: semester.courses.length,
            examCount: semester.courses.reduce((sum, c) => sum + c.exams.length, 0),
            fileCount: semester.courses.reduce((sum, c) => sum + c.exams.reduce((s, e) => s + e.files.length, 0), 0)
        }))

    return <ArchiveClient semesters={archiveData} />
}
