import { prisma } from "@/lib/prisma"
import { CourseManagement } from "./course-management"

export const dynamic = "force-dynamic"

export default async function CoursesPage() {
    const [courses, instructors] = await Promise.all([
        prisma.course.findMany({
            include: {
                instructor: true,
                files: true,
            },
            orderBy: { code: "asc" }
        }),
        prisma.user.findMany({
            where: { role: "INSTRUCTOR" },
            orderBy: { name: "asc" }
        })
    ])

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Ders Yönetimi</h1>
                <p className="text-slate-500">Dersleri oluşturun ve eğitmenlere atayın</p>
            </div>
            <CourseManagement courses={courses} instructors={instructors} />
        </div>
    )
}
