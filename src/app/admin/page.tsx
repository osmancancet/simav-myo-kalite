import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Users, BookOpen, FileText, Clock, ArrowRight, Calendar, Bell, TrendingUp, Shield } from "lucide-react"
import Link from "next/link"
import { getRoleDisplayName } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
    const [users, courses, pendingRequests, totalRequests] = await Promise.all([
        prisma.user.findMany({
            take: 5,
            orderBy: { name: "asc" },
            include: { courses: true }
        }),
        prisma.course.findMany({
            take: 5,
            include: {
                instructor: true,
                exams: { include: { files: true } }
            }
        }),
        prisma.deleteRequest.count({ where: { status: "PENDING" } }),
        prisma.deleteRequest.count()
    ])

    const userCount = await prisma.user.count()
    const courseCount = await prisma.course.count()
    const totalExams = courses.reduce((acc, c) => acc + c.exams.length, 0)
    const totalFiles = courses.reduce((acc, c) =>
        acc + c.exams.reduce((acc2, e) => acc2 + e.files.length, 0), 0
    )

    return (
        <div className="space-y-8">
            {/* Welcome */}
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 p-8 border border-slate-700/50">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#c53030]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
                <div className="relative flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <Shield className="w-8 h-8 text-[#c53030]" />
                            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
                        </div>
                        <p className="text-slate-400">Simav MYO Kalite Yönetim Sistemi'ni buradan yönetin</p>
                    </div>
                    {pendingRequests > 0 && (
                        <Link href="/admin/requests" className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#c53030] text-white shadow-lg hover:bg-[#9b2c2c] transition-all animate-pulse">
                            <Bell className="w-6 h-6" />
                            <div>
                                <p className="text-2xl font-bold">{pendingRequests}</p>
                                <p className="text-sm text-red-100">Bekleyen Talep</p>
                            </div>
                            <ArrowRight className="w-5 h-5 ml-2" />
                        </Link>
                    )}
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border-blue-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                                <Users className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{userCount}</p>
                                <p className="text-sm text-blue-300">Kullanıcı</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border-emerald-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{courseCount}</p>
                                <p className="text-sm text-emerald-300">Ders</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border-amber-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <Calendar className="w-6 h-6 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{totalExams}</p>
                                <p className="text-sm text-amber-300">Sınav</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border-purple-500/20 backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
                                <FileText className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{totalFiles}</p>
                                <p className="text-sm text-purple-300">Dosya</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/admin/users" className="group">
                    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/50 transition-all cursor-pointer overflow-hidden">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Users className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Kullanıcı Yönetimi</h3>
                                <p className="text-slate-400">Eğitmen ve yöneticileri yönetin</p>
                            </div>
                            <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                        </CardContent>
                    </Card>
                </Link>
                <Link href="/admin/requests" className="group">
                    <Card className={`bg-slate-800/50 border-slate-700/50 hover:border-red-500/50 transition-all cursor-pointer overflow-hidden ${pendingRequests > 0 ? 'ring-2 ring-[#c53030]/50' : ''}`}>
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#c53030] to-[#9b2c2c] flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Bell className="w-8 h-8 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-xl font-bold text-white mb-1">Silme Talepleri</h3>
                                <p className="text-slate-400">Dosya silme taleplerini yönetin</p>
                            </div>
                            {pendingRequests > 0 ? (
                                <span className="px-4 py-2 rounded-full bg-[#c53030] text-white font-bold">{pendingRequests}</span>
                            ) : (
                                <ArrowRight className="w-6 h-6 text-slate-500 group-hover:text-red-400 group-hover:translate-x-1 transition-all" />
                            )}
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Recent Data */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Users */}
                <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <Users className="w-5 h-5 text-blue-400" /> Son Kullanıcılar
                        </h3>
                        <Link href="/admin/users" className="text-sm text-blue-400 hover:underline">
                            Tümü →
                        </Link>
                    </div>
                    <CardContent className="p-4 space-y-2">
                        {users.map(u => (
                            <div key={u.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold ${u.role === "MUDUR" ? "bg-gradient-to-br from-purple-500 to-purple-600" :
                                        u.role === "MUDUR_YRD" ? "bg-gradient-to-br from-indigo-500 to-indigo-600" :
                                            "bg-gradient-to-br from-blue-500 to-blue-600"
                                    }`}>
                                    {u.name?.charAt(0) || u.email.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white truncate">{u.name || u.email}</p>
                                    <p className="text-sm text-slate-400">{u.courses.length} ders</p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.role === "MUDUR" ? "bg-purple-500/20 text-purple-300" :
                                        u.role === "MUDUR_YRD" ? "bg-indigo-500/20 text-indigo-300" :
                                            "bg-blue-500/20 text-blue-300"
                                    }`}>
                                    {getRoleDisplayName(u.role)}
                                </span>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* Courses */}
                <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
                    <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                        <h3 className="font-bold text-white flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-emerald-400" /> Son Dersler
                        </h3>
                    </div>
                    <CardContent className="p-4 space-y-2">
                        {courses.length === 0 ? (
                            <p className="text-center py-8 text-slate-500">Henüz ders yok</p>
                        ) : courses.map(c => (
                            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-700/30 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center text-white font-bold text-sm">
                                    {c.code.slice(0, 3)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-white">{c.code}</p>
                                    <p className="text-sm text-slate-400">{c.instructor?.name}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-medium text-slate-300">{c.exams.length} sınav</p>
                                    <p className="text-xs text-slate-500">{c.exams.reduce((acc, e) => acc + e.files.length, 0)} dosya</p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
