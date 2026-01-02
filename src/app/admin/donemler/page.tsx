import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { isAdminRole } from "@/lib/roles"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, CheckCircle2, Plus, GraduationCap, BookOpen, Users } from "lucide-react"
import { SemesterActions } from "./semester-actions"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function SemestersPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) redirect("/hoca")

    const semesters = await prisma.semester.findMany({
        include: {
            courses: {
                include: {
                    exams: {
                        include: {
                            files: true
                        }
                    },
                    instructor: true
                }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const activeSemester = semesters.find(s => s.isActive)

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-violet-600 to-purple-600 flex items-center justify-center shadow-xl shadow-violet-500/20">
                        <Calendar className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Dönem Yönetimi</h1>
                        <p className="text-slate-400 mt-1">Akademik dönemleri oluşturun ve yönetin</p>
                    </div>
                </div>
                <SemesterActions type="create" />
            </div>

            {/* Active Semester Banner */}
            {activeSemester && (
                <Card className="bg-gradient-to-r from-emerald-500/20 to-teal-500/10 border-emerald-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-emerald-300 font-medium">Aktif Dönem</p>
                                    <h3 className="text-xl font-bold text-white">{activeSemester.name}</h3>
                                </div>
                            </div>
                            <div className="flex items-center gap-6 text-sm">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">{activeSemester.courses.length}</p>
                                    <p className="text-emerald-300">Ders</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {activeSemester.courses.reduce((sum, c) => sum + c.exams.length, 0)}
                                    </p>
                                    <p className="text-emerald-300">Sınav</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-white">
                                        {activeSemester.courses.reduce((sum, c) => sum + c.exams.reduce((s, e) => s + e.files.length, 0), 0)}
                                    </p>
                                    <p className="text-emerald-300">Dosya</p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Semester List */}
            <div className="grid gap-4">
                {semesters.length === 0 ? (
                    <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                        <CardContent className="py-16 text-center">
                            <div className="w-20 h-20 rounded-full bg-violet-500/10 flex items-center justify-center mx-auto mb-4">
                                <Calendar className="w-10 h-10 text-violet-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Henüz dönem yok</h3>
                            <p className="text-slate-400 mb-4">İlk akademik dönemi oluşturun</p>
                            <SemesterActions type="create" variant="primary" />
                        </CardContent>
                    </Card>
                ) : (
                    semesters.map((semester) => {
                        const totalExams = semester.courses.reduce((sum, c) => sum + c.exams.length, 0)
                        const totalFiles = semester.courses.reduce((sum, c) => sum + c.exams.reduce((s, e) => s + e.files.length, 0), 0)
                        const uniqueInstructors = new Set(semester.courses.map(c => c.instructorId)).size

                        return (
                            <Card
                                key={semester.id}
                                className={`bg-slate-800/60 border-slate-700/50 backdrop-blur-xl overflow-hidden hover:border-violet-500/30 transition-all ${semester.isActive ? 'ring-2 ring-emerald-500/50' : ''
                                    }`}
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${semester.isActive
                                                    ? 'bg-emerald-500/20'
                                                    : 'bg-slate-700/50'
                                                }`}>
                                                <GraduationCap className={`w-7 h-7 ${semester.isActive ? 'text-emerald-400' : 'text-slate-400'
                                                    }`} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-white">{semester.name}</h3>
                                                    {semester.isActive && (
                                                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
                                                            Aktif
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 mt-0.5">
                                                    {semester.year} • {semester.term === "GUZ" ? "Güz Dönemi" : semester.term === "BAHAR" ? "Bahar Dönemi" : "Yaz Okulu"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-8">
                                            <div className="flex items-center gap-6">
                                                <div className="text-center">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <BookOpen className="w-4 h-4" />
                                                        <span className="text-xl font-bold text-white">{semester.courses.length}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">Ders</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Calendar className="w-4 h-4" />
                                                        <span className="text-xl font-bold text-white">{totalExams}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">Sınav</p>
                                                </div>
                                                <div className="text-center">
                                                    <div className="flex items-center gap-2 text-slate-400">
                                                        <Users className="w-4 h-4" />
                                                        <span className="text-xl font-bold text-white">{uniqueInstructors}</span>
                                                    </div>
                                                    <p className="text-xs text-slate-500">Hoca</p>
                                                </div>
                                            </div>
                                            <SemesterActions
                                                type="manage"
                                                semesterId={semester.id}
                                                isActive={semester.isActive}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })
                )}
            </div>
        </div>
    )
}
