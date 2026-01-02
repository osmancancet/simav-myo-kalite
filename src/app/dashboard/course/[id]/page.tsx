import { auth } from "@/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { ChevronLeft, Plus, FileText, Award, BarChart2, TrendingDown, Calendar, Trash2 } from "lucide-react"
import Link from "next/link"
import { notFound, redirect } from "next/navigation"
import { AddExamDialog } from "./add-exam-dialog"
import { ExamCard } from "./exam-card"

export const dynamic = "force-dynamic"

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
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

    // Verify ownership or admin
    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    const isAdmin = user?.role === "MUDUR" || user?.role === "MUDUR_YRD"
    const isOwner = course.instructor.email === session.user.email

    if (!isOwner && !isAdmin) {
        redirect("/dashboard")
    }

    const totalFiles = course.exams.reduce((acc, exam) => acc + exam.files.length, 0)

    return (
        <div className="p-8 space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/dashboard">
                    <Button variant="ghost" size="icon" className="rounded-full w-12 h-12 bg-white shadow-lg hover:shadow-xl border border-slate-200">
                        <ChevronLeft className="w-6 h-6 text-[#1a365d]" />
                    </Button>
                </Link>
                <div className="flex-1">
                    <h1 className="text-3xl font-bold text-[#1a365d]">{course.code}</h1>
                    <p className="text-slate-500">{course.name}</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right bg-white px-5 py-3 rounded-xl shadow border border-slate-200">
                        <p className="text-2xl font-bold text-[#1a365d]">{course.exams.length}</p>
                        <p className="text-xs text-slate-500">Sınav</p>
                    </div>
                    <div className="text-right bg-white px-5 py-3 rounded-xl shadow border border-slate-200">
                        <p className="text-2xl font-bold text-emerald-600">{totalFiles}</p>
                        <p className="text-xs text-slate-500">Dosya</p>
                    </div>
                </div>
            </div>

            {/* Add Exam Section */}
            <Card className="border-0 shadow-lg bg-gradient-to-r from-[#1a365d] to-[#2d4a7c] text-white">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                                <Calendar className="w-7 h-7" />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold">Sınav Ekle</h2>
                                <p className="text-blue-200 text-sm">Vize, Final, Bütünleme gibi sınavları ekleyin</p>
                            </div>
                        </div>
                        <AddExamDialog courseId={course.id} />
                    </div>
                </CardContent>
            </Card>

            {/* Exams List */}
            {course.exams.length === 0 ? (
                <Card className="border-2 border-dashed border-slate-300 bg-white/50 shadow-none">
                    <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10 text-slate-400" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-700 mb-2">Henüz sınav eklenmemiş</h3>
                        <p className="text-slate-500">İlk sınavınızı ekleyerek başlayın.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {course.exams.map((exam) => (
                        <ExamCard key={exam.id} exam={exam} courseCode={course.code} />
                    ))}
                </div>
            )}
        </div>
    )
}
