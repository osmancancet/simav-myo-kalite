import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import {
    ChevronLeft, Calendar, FileText, CheckCircle, Clock,
    Award, TrendingUp, Plus, BookOpen, BarChart2
} from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AddExamDialog } from "./add-exam-dialog"
import { ExamCard } from "./exam-card"

export const dynamic = "force-dynamic"

export default async function HocaCourseDetail({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            instructor: true,
            exams: {
                orderBy: { createdAt: "desc" },
                include: {
                    files: {
                        include: { deleteRequest: true }
                    }
                }
            }
        }
    })

    if (!course) notFound()

    // Get current user to check if admin
    const currentUser = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    // Verify ownership or admin access
    const isOwner = course.instructor.email === session.user.email
    const isAdmin = currentUser && (currentUser.role === "MUDUR" || currentUser.role === "MUDUR_YRD")

    if (!isOwner && !isAdmin) {
        redirect("/hoca")
    }

    const totalFiles = course.exams.reduce((acc, exam) => acc + exam.files.length, 0)
    const completedExams = course.exams.filter(e => e.files.length >= 3).length
    const completionRate = course.exams.length > 0 ? Math.round((completedExams / course.exams.length) * 100) : 0

    // Calculate average grades
    const allGrades = course.exams.flatMap(e => e.files.filter(f => f.grade !== null).map(f => f.grade as number))
    const avgGrade = allGrades.length > 0 ? Math.round(allGrades.reduce((a, b) => a + b, 0) / allGrades.length) : null

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/hoca/derslerim">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl w-12 h-12">
                        <ChevronLeft className="w-6 h-6" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                            {course.code.slice(0, 3)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{course.code}</h1>
                            <p className="text-slate-400 text-lg">{course.name}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{course.exams.length}</p>
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
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/30 flex items-center justify-center">
                                <BarChart2 className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{avgGrade ?? "-"}</p>
                                <p className="text-xs text-blue-300">Ort. Not</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add Exam Section */}
            <Card className="bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-indigo-500/20 border-blue-500/30 backdrop-blur-xl">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center shadow-lg">
                                <Plus className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white">Yeni Sınav Ekle</h2>
                                <p className="text-blue-300 text-sm">Vize, Final, Bütünleme veya Quiz ekleyin</p>
                            </div>
                        </div>
                        <AddExamDialog courseId={course.id} />
                    </div>
                </CardContent>
            </Card>

            {/* Exams List */}
            {course.exams.length === 0 ? (
                <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                    <CardContent className="py-20 text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-6">
                            <Calendar className="w-12 h-12 text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-3">Henüz sınav eklenmemiş</h3>
                        <p className="text-slate-400 mb-6 max-w-md mx-auto">
                            Her sınav için en iyi, orta ve en düşük kağıtları yükleyebilirsiniz.
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-slate-400" />
                        </div>
                        <h2 className="text-xl font-bold text-white">Sınavlar</h2>
                        <span className="px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 text-sm font-medium">
                            {course.exams.length}
                        </span>
                    </div>
                    {course.exams.map((exam) => (
                        <ExamCard key={exam.id} exam={exam} courseCode={course.code} />
                    ))}
                </div>
            )}
        </div>
    )
}
