import { auth } from "@/auth"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { BookOpen, ChevronRight, Plus, Calendar, FileText, FolderOpen } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function MyCoursesPage() {
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

    const courses = user?.courses || []
    const totalExams = courses.reduce((acc, c) => acc + c.exams.length, 0)
    const totalFiles = courses.reduce((acc, c) => acc + c.exams.reduce((acc2, e) => acc2 + e.files.length, 0), 0)

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1a365d] to-[#2d4a7c] flex items-center justify-center shadow-lg">
                        <FolderOpen className="w-7 h-7 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Derslerim</h1>
                        <p className="text-slate-500">{courses.length} ders, {totalExams} sınav, {totalFiles} dosya</p>
                    </div>
                </div>
                <Link href="/dashboard/add-course">
                    <Button className="bg-[#c53030] hover:bg-[#9b2c2c] text-white gap-2 h-12 px-6 rounded-xl shadow-lg">
                        <Plus className="w-5 h-5" />
                        Yeni Ders
                    </Button>
                </Link>
            </div>

            {/* Courses */}
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
                    {courses.map((course) => {
                        const examCount = course.exams.length
                        const fileCount = course.exams.reduce((acc, e) => acc + e.files.length, 0)
                        const completedExams = course.exams.filter(e => e.files.length >= 3).length

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

                                        {/* Progress */}
                                        {examCount > 0 && (
                                            <div className="mb-4">
                                                <div className="flex items-center justify-between text-xs mb-1">
                                                    <span className="text-slate-500">Tamamlanan</span>
                                                    <span className="font-medium text-[#1a365d]">{completedExams}/{examCount}</span>
                                                </div>
                                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full transition-all"
                                                        style={{ width: `${examCount > 0 ? (completedExams / examCount) * 100 : 0}%` }}
                                                    />
                                                </div>
                                            </div>
                                        )}

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
