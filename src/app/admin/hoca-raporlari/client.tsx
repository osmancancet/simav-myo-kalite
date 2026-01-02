"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    BookOpen, Calendar, ChevronRight,
    CheckCircle, AlertCircle, User, Shield, Plus
} from "lucide-react"
import { getRoleDisplayName } from "@/lib/roles"
import { AdminAddButton } from "@/components/AdminAddModals"

interface FileData {
    id: string
    type: string
    filename: string
}

interface ExamData {
    id: string
    name: string
    courseId: string
    files: FileData[]
}

interface CourseData {
    id: string
    code: string
    name: string
    exams: ExamData[]
}

interface UserData {
    id: string
    name: string | null
    email: string
    role: string
    courses: CourseData[]
}

function getExamPriority(examName: string): number {
    const upperName = examName.toUpperCase()
    if (upperName.includes("VİZE") || upperName.includes("VIZE")) return 1
    if (upperName.includes("FİNAL") || upperName.includes("FINAL")) return 2
    if (upperName.includes("BÜT") || upperName.includes("BUTUNLEME")) return 3
    return 4
}

interface Props {
    admins: UserData[]
    instructors: UserData[]
}

export function HocaRaporlariClient({ admins, instructors }: Props) {
    const renderUserSection = (users: UserData[], title: string, icon: any, color: string) => {
        const Icon = icon
        return (
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center`}>
                        <Icon className="w-5 h-5 text-white" />
                    </div>
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <span className="px-2.5 py-1 rounded-full bg-slate-700 text-slate-300 text-sm">
                        {users.length}
                    </span>
                </div>

                <div className="space-y-3">
                    {users.map(user => {
                        const userExams = user.courses.reduce((a, c) => a + c.exams.length, 0)
                        const userFiles = user.courses.reduce((a, c) => a + c.exams.reduce((a2, e) => a2 + e.files.length, 0), 0)
                        const userCompleted = user.courses.reduce((a, c) => a + c.exams.filter(e => e.files.length >= 3).length, 0)
                        const completionRate = userExams > 0 ? Math.round((userCompleted / userExams) * 100) : 0

                        return (
                            <Card key={user.id} className="bg-slate-800/50 border-slate-700/50">
                                <CardContent className="p-0">
                                    <details className="group">
                                        <summary className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-700/30 transition-colors list-none">
                                            <ChevronRight className="w-5 h-5 text-slate-500 group-open:rotate-90 transition-transform" />
                                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-white">{user.name || user.email}</h3>
                                                <p className="text-sm text-slate-400">{getRoleDisplayName(user.role)}</p>
                                            </div>
                                            <AdminAddButton
                                                type="course"
                                                userId={user.id}
                                                userName={user.name || user.email}
                                            />
                                            <div className="flex items-center gap-6 text-sm">
                                                <div className="text-center">
                                                    <p className="font-bold text-blue-400">{user.courses.length}</p>
                                                    <p className="text-xs text-slate-500">Ders</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-amber-400">{userExams}</p>
                                                    <p className="text-xs text-slate-500">Sınav</p>
                                                </div>
                                                <div className="text-center">
                                                    <p className="font-bold text-emerald-400">{userFiles}</p>
                                                    <p className="text-xs text-slate-500">Dosya</p>
                                                </div>
                                                <div className="w-20">
                                                    <div className="flex items-center justify-between text-xs mb-1">
                                                        <span className={completionRate === 100 ? "text-emerald-400" : "text-slate-500"}>
                                                            %{completionRate}
                                                        </span>
                                                    </div>
                                                    <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                                        <div
                                                            className={`h-full rounded-full ${completionRate === 100 ? "bg-emerald-500" : "bg-blue-500"}`}
                                                            style={{ width: `${completionRate}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </summary>

                                        <div className="border-t border-slate-700/50 p-4 space-y-3">
                                            {user.courses.length === 0 ? (
                                                <p className="text-slate-500 text-sm text-center py-4">Henüz ders eklenmemiş</p>
                                            ) : (
                                                user.courses.map(course => {
                                                    const sortedExams = [...course.exams].sort((a, b) =>
                                                        getExamPriority(a.name) - getExamPriority(b.name)
                                                    )
                                                    const courseCompleted = course.exams.filter(e => e.files.length >= 3).length
                                                    const courseTotal = course.exams.length

                                                    return (
                                                        <details key={course.id} className="group/course">
                                                            <summary className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 cursor-pointer hover:bg-slate-700/50 transition-colors list-none">
                                                                <ChevronRight className="w-4 h-4 text-slate-500 group-open/course:rotate-90 transition-transform" />
                                                                <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                                                    <BookOpen className="w-4 h-4 text-blue-400" />
                                                                </div>
                                                                <div className="flex-1">
                                                                    <span className="font-medium text-white">{course.code}</span>
                                                                    <span className="text-slate-400 ml-2">- {course.name}</span>
                                                                </div>
                                                                <AdminAddButton
                                                                    type="exam"
                                                                    courseId={course.id}
                                                                    courseName={`${course.code} - ${course.name}`}
                                                                />
                                                                <div className="flex items-center gap-2">
                                                                    {courseCompleted === courseTotal && courseTotal > 0 ? (
                                                                        <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                                                                            <CheckCircle className="w-3 h-3" /> Tamamlandı
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-xs text-slate-500">{courseCompleted}/{courseTotal}</span>
                                                                    )}
                                                                </div>
                                                            </summary>

                                                            <div className="ml-8 mt-2 space-y-2">
                                                                {sortedExams.length === 0 ? (
                                                                    <p className="text-slate-500 text-xs py-2 pl-4">Sınav eklenmemiş</p>
                                                                ) : (
                                                                    sortedExams.map(exam => {
                                                                        const isComplete = exam.files.length >= 3
                                                                        const hasBest = exam.files.some(f => f.type === "BEST")
                                                                        const hasAvg = exam.files.some(f => f.type === "AVERAGE")
                                                                        const hasWorst = exam.files.some(f => f.type === "WORST")

                                                                        return (
                                                                            <div
                                                                                key={exam.id}
                                                                                className={`flex items-center gap-3 p-2.5 rounded-lg border ${isComplete
                                                                                        ? "bg-emerald-500/10 border-emerald-500/30"
                                                                                        : "bg-slate-700/20 border-slate-600/30"
                                                                                    }`}
                                                                            >
                                                                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${exam.name.toUpperCase().includes("VİZE") || exam.name.toUpperCase().includes("VIZE")
                                                                                        ? "bg-blue-500/30 text-blue-400"
                                                                                        : exam.name.toUpperCase().includes("FİNAL") || exam.name.toUpperCase().includes("FINAL")
                                                                                            ? "bg-amber-500/30 text-amber-400"
                                                                                            : "bg-purple-500/30 text-purple-400"
                                                                                    }`}>
                                                                                    <Calendar className="w-3.5 h-3.5" />
                                                                                </div>
                                                                                <span className="flex-1 text-sm text-white">{exam.name}</span>
                                                                                <div className="flex items-center gap-1">
                                                                                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center ${hasBest ? "bg-emerald-500/30 text-emerald-400" : "bg-slate-600/30 text-slate-500"
                                                                                        }`}>İ</span>
                                                                                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center ${hasAvg ? "bg-amber-500/30 text-amber-400" : "bg-slate-600/30 text-slate-500"
                                                                                        }`}>O</span>
                                                                                    <span className={`w-5 h-5 rounded text-xs flex items-center justify-center ${hasWorst ? "bg-red-500/30 text-red-400" : "bg-slate-600/30 text-slate-500"
                                                                                        }`}>D</span>
                                                                                </div>
                                                                                {isComplete ? (
                                                                                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                                                                                ) : (
                                                                                    <AlertCircle className="w-4 h-4 text-amber-400" />
                                                                                )}
                                                                            </div>
                                                                        )
                                                                    })
                                                                )}
                                                            </div>
                                                        </details>
                                                    )
                                                })
                                            )}
                                        </div>
                                    </details>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {admins.length > 0 && renderUserSection(admins, "İdareciler", Shield, "bg-gradient-to-br from-purple-500 to-purple-600")}
            {renderUserSection(instructors, "Öğretim Üyeleri", User, "bg-gradient-to-br from-blue-500 to-blue-600")}
        </div>
    )
}
