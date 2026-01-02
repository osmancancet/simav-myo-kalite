import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { redirect } from "next/navigation"
import { BookOpen, ChevronRight, Plus, Calendar, FileText, ArrowRight, Lightbulb } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
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

    return (
        <div className="p-8">
            {/* Welcome Banner */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#1a365d] via-[#2d4a7c] to-[#1a365d] p-8 mb-8 shadow-2xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
                <div className="relative">
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Hoş Geldiniz, {session?.user?.name?.split(" ")[0]}! 👋
                    </h1>
                    <p className="text-blue-200 text-lg mb-6">
                        Sınav kağıtlarınızı dijital ortamda güvenle arşivleyin
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
                            <BookOpen className="w-6 h-6 text-white" />
                            <div>
                                <p className="text-2xl font-bold text-white">{courses.length}</p>
                                <p className="text-sm text-blue-200">Ders</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
                            <Calendar className="w-6 h-6 text-white" />
                            <div>
                                <p className="text-2xl font-bold text-white">{totalExams}</p>
                                <p className="text-sm text-blue-200">Sınav</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3">
                            <FileText className="w-6 h-6 text-white" />
                            <div>
                                <p className="text-2xl font-bold text-white">{totalFiles}</p>
                                <p className="text-sm text-blue-200">Dosya</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <Link href="/dashboard/add-course" className="group">
                    <Card className="border-2 border-dashed border-[#1a365d]/30 bg-white/50 hover:bg-[#1a365d]/5 hover:border-[#1a365d] transition-all cursor-pointer">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-[#1a365d] flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                                <Plus className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-[#1a365d]">Yeni Ders Ekle</h3>
                                <p className="text-slate-500">Verdiğiniz dersi sisteme ekleyin</p>
                            </div>
                            <ArrowRight className="w-5 h-5 text-slate-400 ml-auto group-hover:translate-x-1 transition-transform" />
                        </CardContent>
                    </Card>
                </Link>
                <Card className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200/50">
                    <CardContent className="p-6 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
                            <Lightbulb className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-amber-900">Nasıl Çalışır?</h3>
                            <p className="text-amber-700 text-sm">Ders ekle → Sınav ekle → 3 PDF yükle</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Courses Grid */}
            <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-800">Derslerim</h2>
                {courses.length > 0 && (
                    <Link href="/dashboard/my-courses" className="text-[#1a365d] hover:underline text-sm font-medium">
                        Tümünü Gör →
                    </Link>
                )}
            </div>

            {courses.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-300 bg-gradient-to-br from-white to-slate-50">
                    <CardContent className="py-16 text-center">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <BookOpen className="w-12 h-12 text-slate-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-slate-700 mb-2">Henüz ders eklenmemiş</h3>
                        <p className="text-slate-500 mb-8 max-w-md mx-auto">
                            Sınav kağıtlarınızı arşivlemek için önce bir ders oluşturun
                        </p>
                        <Link href="/dashboard/add-course">
                            <Button size="lg" className="bg-[#c53030] hover:bg-[#9b2c2c] text-white gap-2 rounded-xl shadow-lg px-8 h-14 text-lg">
                                <Plus className="w-6 h-6" />
                                İlk Dersinizi Ekleyin
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {courses.slice(0, 6).map((course) => {
                        const examCount = course.exams.length
                        const fileCount = course.exams.reduce((acc, e) => acc + e.files.length, 0)

                        return (
                            <Link key={course.id} href={`/dashboard/course/${course.id}`}>
                                <Card className="h-full border-0 bg-white shadow-lg hover:shadow-2xl transition-all cursor-pointer group overflow-hidden hover:-translate-y-1">
                                    <div className="h-2 bg-gradient-to-r from-[#1a365d] to-[#2d4a7c]" />
                                    <CardContent className="p-6">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#2d4a7c] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                                <span className="text-white font-bold">{course.code.slice(0, 3)}</span>
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1a365d] transition-colors">
                                                    {course.code}
                                                </h3>
                                                <p className="text-slate-500 text-sm line-clamp-1">{course.name}</p>
                                            </div>
                                            <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-[#1a365d] group-hover:translate-x-1 transition-all" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100">
                                                <p className="text-2xl font-bold text-amber-600">{examCount}</p>
                                                <p className="text-xs font-medium text-amber-600">Sınav</p>
                                            </div>
                                            <div className="text-center p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                                                <p className="text-2xl font-bold text-emerald-600">{fileCount}</p>
                                                <p className="text-xs font-medium text-emerald-600">Dosya</p>
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
    )
}
