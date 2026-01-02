import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, Plus, Calendar, FileText, TrendingUp, Award, BarChart2, TrendingDown, ChevronRight, Clock, Target, Zap, ArrowUpRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function HocaDashboard() {
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
                orderBy: { createdAt: "desc" }
            }
        },
    })

    const courses = user?.courses || []
    const totalExams = courses.reduce((acc, c) => acc + c.exams.length, 0)
    const totalFiles = courses.reduce((acc, c) => acc + c.exams.reduce((acc2, e) => acc2 + e.files.length, 0), 0)

    const completedExams = courses.reduce((acc, c) => acc + c.exams.filter(e => e.files.length >= 3).length, 0)
    const bestFiles = courses.reduce((acc, c) => acc + c.exams.reduce((acc2, e) => acc2 + e.files.filter(f => f.type === "BEST").length, 0), 0)
    const avgFiles = courses.reduce((acc, c) => acc + c.exams.reduce((acc2, e) => acc2 + e.files.filter(f => f.type === "AVERAGE").length, 0), 0)
    const worstFiles = courses.reduce((acc, c) => acc + c.exams.reduce((acc2, e) => acc2 + e.files.filter(f => f.type === "WORST").length, 0), 0)
    const completionRate = totalExams > 0 ? Math.round((completedExams / totalExams) * 100) : 0
    const pendingExams = totalExams - completedExams

    const upcomingEvents = await prisma.academicEvent.findMany({
        where: {
            startDate: { gte: new Date() }
        },
        orderBy: { startDate: "asc" },
        take: 3
    })

    return (
        <div className="space-y-8">
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Hoş Geldiniz, {session?.user?.name?.split(" ")[0]}! 👋
                    </h1>
                    <p className="text-slate-400">
                        Bugün {new Date().toLocaleDateString("tr-TR", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>
                <Link href="/hoca/ders-ekle">
                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2 h-12 px-6 rounded-xl shadow-lg shadow-blue-500/20">
                        <Plus className="w-5 h-5" />
                        Yeni Ders
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30 hover:border-blue-400/50 transition-colors">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <BookOpen className="w-5 h-5 text-blue-400" />
                            </div>
                            <Link href="/hoca/derslerim" className="text-blue-400 hover:text-blue-300">
                                <ArrowUpRight className="w-5 h-5" />
                            </Link>
                        </div>
                        <p className="text-3xl font-bold text-white">{courses.length}</p>
                        <p className="text-sm text-blue-300 mt-1">Aktif Ders</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-400/50 transition-colors">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-amber-400" />
                            </div>
                            <span className="text-xs text-amber-400 bg-amber-500/20 px-2 py-1 rounded-full">
                                {pendingExams} bekliyor
                            </span>
                        </div>
                        <p className="text-3xl font-bold text-white">{totalExams}</p>
                        <p className="text-sm text-amber-300 mt-1">Toplam Sınav</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/50 transition-colors">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-emerald-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">{totalFiles}</p>
                        <p className="text-sm text-emerald-300 mt-1">Yüklenen Dosya</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/30 hover:border-purple-400/50 transition-colors">
                    <CardContent className="p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <Target className="w-5 h-5 text-purple-400" />
                            </div>
                        </div>
                        <p className="text-3xl font-bold text-white">%{completionRate}</p>
                        <div className="flex items-center gap-2 mt-1">
                            <div className="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                <div className="h-full bg-purple-500 rounded-full" style={{ width: `${completionRate}%` }} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Son Dersler</h2>
                        {courses.length > 0 && (
                            <Link href="/hoca/derslerim" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
                                Tümünü Gör <ChevronRight className="w-4 h-4" />
                            </Link>
                        )}
                    </div>

                    {courses.length === 0 ? (
                        <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                            <CardContent className="py-16 text-center">
                                <div className="w-20 h-20 rounded-2xl bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                                    <BookOpen className="w-10 h-10 text-slate-500" />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-2">Henüz ders eklenmemiş</h3>
                                <p className="text-slate-400 mb-6">Sınav kağıtlarınızı arşivlemek için ilk dersinizi ekleyin</p>
                                <Link href="/hoca/ders-ekle">
                                    <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white gap-2 rounded-xl">
                                        <Plus className="w-5 h-5" />
                                        İlk Dersinizi Ekleyin
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-3">
                            {courses.slice(0, 5).map((course) => {
                                const examCount = course.exams.length
                                const fileCount = course.exams.reduce((acc, e) => acc + e.files.length, 0)
                                const completed = course.exams.filter(e => e.files.length >= 3).length
                                const progress = examCount > 0 ? (completed / examCount) * 100 : 0

                                return (
                                    <Link key={course.id} href={`/hoca/ders/${course.id}`}>
                                        <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all cursor-pointer group">
                                            <CardContent className="p-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                                                        {course.code.slice(0, 3)}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors">{course.code}</h3>
                                                            {completed === examCount && examCount > 0 && (
                                                                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">✓ Tamamlandı</span>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-slate-400 truncate">{course.name}</p>
                                                    </div>
                                                    <div className="flex items-center gap-4 shrink-0">
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-amber-400">{examCount}</p>
                                                            <p className="text-xs text-slate-500">sınav</p>
                                                        </div>
                                                        <div className="text-center">
                                                            <p className="text-lg font-bold text-emerald-400">{fileCount}</p>
                                                            <p className="text-xs text-slate-500">dosya</p>
                                                        </div>
                                                        <div className="w-20">
                                                            <div className="flex items-center justify-between text-xs mb-1">
                                                                <span className="text-slate-500">{completed}/{examCount}</span>
                                                            </div>
                                                            <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                                <div className="h-full bg-gradient-to-r from-blue-400 to-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <BarChart2 className="w-5 h-5 text-blue-400" />
                                Dosya Dağılımı
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center">
                                        <Award className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-slate-300">En İyi</span>
                                            <span className="text-sm font-bold text-emerald-400">{bestFiles}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${totalFiles > 0 ? (bestFiles / totalFiles) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                                        <TrendingUp className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-slate-300">Orta</span>
                                            <span className="text-sm font-bold text-amber-400">{avgFiles}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${totalFiles > 0 ? (avgFiles / totalFiles) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center">
                                        <TrendingDown className="w-5 h-5 text-red-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between mb-1">
                                            <span className="text-sm text-slate-300">En Düşük</span>
                                            <span className="text-sm font-bold text-red-400">{worstFiles}</span>
                                        </div>
                                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                            <div className="h-full bg-red-500 rounded-full" style={{ width: `${totalFiles > 0 ? (worstFiles / totalFiles) * 100 : 0}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-slate-800/50 border-slate-700/50">
                        <CardContent className="p-5">
                            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                                <Clock className="w-5 h-5 text-purple-400" />
                                Yaklaşan Etkinlikler
                            </h3>
                            {upcomingEvents.length === 0 ? (
                                <p className="text-sm text-slate-500 text-center py-4">Yaklaşan etkinlik yok</p>
                            ) : (
                                <div className="space-y-3">
                                    {upcomingEvents.map((event) => (
                                        <div key={event.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-xs ${event.type === "EXAM" ? "bg-red-500/30" :
                                                    event.type === "DEADLINE" ? "bg-amber-500/30" :
                                                        "bg-blue-500/30"
                                                }`}>
                                                {new Date(event.startDate).getDate()}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-white truncate">{event.title}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(event.startDate).toLocaleDateString("tr-TR", { month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                            <Link href="/hoca/takvim" className="flex items-center justify-center gap-1 text-sm text-purple-400 hover:text-purple-300 mt-4">
                                Takvimi Görüntüle <ChevronRight className="w-4 h-4" />
                            </Link>
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
                        <CardContent className="p-5">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <Zap className="w-5 h-5 text-blue-400" />
                                </div>
                                <h3 className="font-bold text-white">Hızlı İpucu</h3>
                            </div>
                            <p className="text-sm text-slate-300">
                                Her sınav için <span className="text-emerald-400 font-medium">En İyi</span>,
                                <span className="text-amber-400 font-medium"> Orta</span> ve
                                <span className="text-red-400 font-medium"> En Düşük</span> kağıdı yükleyerek
                                kalite standardını tamamlayın.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
