import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import {
    Users, BookOpen, Calendar,
    TrendingUp
} from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { isAdminRole } from "@/lib/roles"
import { HocaRaporlariClient } from "./client"

export const dynamic = "force-dynamic"

export default async function HierarchicalReportsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!currentUser || !isAdminRole(currentUser.role)) redirect("/hoca")

    const allUsers = await prisma.user.findMany({
        include: {
            courses: {
                include: {
                    exams: {
                        include: { files: true }
                    }
                }
            }
        },
        orderBy: { name: "asc" }
    })

    const admins = allUsers.filter(u => u.role === "MUDUR" || u.role === "MUDUR_YRD")
    const instructors = allUsers.filter(u => u.role === "HOCA")

    const totalCourses = allUsers.reduce((acc, u) => acc + u.courses.length, 0)
    const totalExams = allUsers.reduce((acc, u) => acc + u.courses.reduce((a, c) => a + c.exams.length, 0), 0)
    const completedExams = allUsers.reduce((acc, u) => acc + u.courses.reduce((a, c) => a + c.exams.filter(e => e.files.length >= 3).length, 0), 0)

    const serializeUser = (u: typeof allUsers[0]) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        courses: u.courses.map(c => ({
            id: c.id,
            code: c.code,
            name: c.name,
            exams: c.exams.map(e => ({
                id: e.id,
                name: e.name,
                courseId: e.courseId,
                files: e.files.map(f => ({
                    id: f.id,
                    type: f.type,
                    filename: f.filename
                }))
            }))
        }))
    })

    const serializedAdmins = admins.map(serializeUser)
    const serializedInstructors = instructors.map(serializeUser)

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Hoca Bazlı Raporlar</h1>
                        <p className="text-slate-400 mt-1">Kullanıcı → Ders → Sınav hiyerarşisi</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{instructors.length}</p>
                                <p className="text-sm text-blue-300">Öğretim Üyesi</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{totalCourses}</p>
                                <p className="text-sm text-emerald-300">Toplam Ders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/30 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{totalExams}</p>
                                <p className="text-sm text-amber-300">Toplam Sınav</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">
                                    %{totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0}
                                </p>
                                <p className="text-sm text-purple-300">Tamamlanma</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <HocaRaporlariClient admins={serializedAdmins} instructors={serializedInstructors} />
        </div>
    )
}
