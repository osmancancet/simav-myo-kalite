import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import {
    BookOpen, ChevronRight, Plus, FolderOpen, Calendar,
    FileText, CheckCircle, Clock, TrendingUp
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { isAdminRole } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function AdminDerslerim() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            courses: {
                include: {
                    exams: {
                        include: { files: true }
                    }
                },
                orderBy: { code: "asc" }
            }
        },
    })

    if (!user || !isAdminRole(user.role)) redirect("/hoca")

    const courses = user?.courses || []

    // Calculate overall stats
    const totalExams = courses.reduce((acc, c) => acc + c.exams.length, 0)
    const totalFiles = courses.reduce((acc, c) => acc + c.exams.reduce((acc2, e) => acc2 + e.files.length, 0), 0)
    const completedExams = courses.reduce((acc, c) => acc + c.exams.filter(e => e.files.length >= 3).length, 0)
    const completionRate = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                        <FolderOpen className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Derslerim</h1>
                        <p className="text-slate-400 mt-1">Kendi derslerinizi yönetin</p>
                    </div>
                </div>
                <Link href="/admin/ders-ekle">
                    <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white gap-2 h-12 px-6 rounded-xl shadow-lg shadow-red-500/20">
                        <Plus className="w-5 h-5" />
                        Yeni Ders
                    </Button>
                </Link>
            </div>

            {/* Quick Stats */}
            {courses.length > 0 && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{courses.length}</p>
                                    <p className="text-xs text-blue-300">Ders</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-amber-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalExams}</p>
                                    <p className="text-xs text-amber-300">Sınav</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-emerald-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{totalFiles}</p>
                                    <p className="text-xs text-emerald-300">Dosya</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/30">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-purple-500/30 flex items-center justify-center">
                                    <TrendingUp className="w-5 h-5 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{completionRate}%</p>
                                    <p className="text-xs text-purple-300">Tamamlanan</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Courses */}
            {courses.length === 0 ? (
                <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                    <CardContent className="py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-12 h-12 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Henüz ders eklenmemiş</h3>
                        <p className="text-slate-400 mb-8 max-w-md mx-auto">
                            Sınav kağıtlarınızı arşivlemek için ilk dersinizi ekleyin.
                        </p>
                        <Link href="/admin/ders-ekle">
                            <Button className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white gap-2 h-12 px-8 rounded-xl shadow-lg">
                                <Plus className="w-5 h-5" />
                                İlk Dersinizi Ekleyin
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {courses.map((course) => {
                        const examCount = course.exams.length
                        const fileCount = course.exams.reduce((acc, e) => acc + e.files.length, 0)
                        const completed = course.exams.filter(e => e.files.length >= 3).length
                        const isComplete = examCount > 0 && completed === examCount
                        const hasExams = examCount > 0

                        return (
                            <Link key={course.id} href={`/admin/ders/${course.id}`}>
                                <Card className={`bg-slate-800/60 border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer group h-full backdrop-blur-xl overflow-hidden ${isComplete ? 'ring-2 ring-emerald-500/30' : ''}`}>
                                    <div className={`h-1.5 ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : hasExams ? 'bg-gradient-to-r from-blue-400 to-blue-500' : 'bg-slate-700'}`} />

                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-5">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg group-hover:scale-105 transition-transform shadow-lg">
                                                {course.code.slice(0, 3)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{course.code}</h3>
                                                    {isComplete && (
                                                        <span className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                                                            <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-slate-400 line-clamp-2 mt-1">{course.name}</p>
                                            </div>
                                            <ChevronRight className="w-6 h-6 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </div>

                                        {hasExams && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-sm mb-2">
                                                    <span className="text-slate-400">İlerleme</span>
                                                    <span className={`font-medium ${isComplete ? 'text-emerald-400' : 'text-blue-400'}`}>
                                                        {completed}/{examCount} sınav
                                                    </span>
                                                </div>
                                                <div className="h-2 bg-slate-700/50 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-500 ${isComplete ? 'bg-gradient-to-r from-emerald-400 to-emerald-500' : 'bg-gradient-to-r from-blue-400 to-blue-500'}`}
                                                        style={{ width: `${examCount > 0 ? (completed / examCount) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-3 gap-3">
                                            <div className="text-center p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                                    <Calendar className="w-4 h-4 text-amber-400" />
                                                    <p className="text-xl font-bold text-white">{examCount}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">Sınav</p>
                                            </div>
                                            <div className="text-center p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                                    <FileText className="w-4 h-4 text-emerald-400" />
                                                    <p className="text-xl font-bold text-white">{fileCount}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">Dosya</p>
                                            </div>
                                            <div className="text-center p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                                <div className="flex items-center justify-center gap-1.5 mb-1">
                                                    <CheckCircle className="w-4 h-4 text-purple-400" />
                                                    <p className="text-xl font-bold text-white">{completed}</p>
                                                </div>
                                                <p className="text-xs text-slate-400">Tamam</p>
                                            </div>
                                        </div>

                                        {!hasExams && (
                                            <div className="mt-4 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                                <p className="text-sm text-blue-300 flex items-center gap-2">
                                                    <Clock className="w-4 h-4" />
                                                    Henüz sınav eklenmedi
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
