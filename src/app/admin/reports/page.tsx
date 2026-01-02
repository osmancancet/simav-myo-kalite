"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BarChart, PieChart, DoughnutChart } from "@/components/Charts"
import {
    BarChart2, FileSpreadsheet, Loader2, Calendar, Users, BookOpen,
    FileText, TrendingUp, ArrowUpRight, ArrowDownRight, Sparkles,
    Download, RefreshCw
} from "lucide-react"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

interface Stats {
    userCount: number
    courseCount: number
    examCount: number
    fileCount: number
    completedExams: number
    usersByRole: { role: string; count: number }[]
    filesByType: { type: string; count: number }[]
    monthlyUploads: { month: string; count: number }[]
}

// Animated Counter Component
function AnimatedCounter({ value, duration = 1000 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0)

    useEffect(() => {
        let start = 0
        const end = value
        if (start === end) return

        const incrementTime = duration / end
        const timer = setInterval(() => {
            start += 1
            setCount(start)
            if (start >= end) clearInterval(timer)
        }, incrementTime)

        return () => clearInterval(timer)
    }, [value, duration])

    return <span>{count}</span>
}

// Stat Card Component
function StatCard({
    icon: Icon,
    value,
    label,
    color,
    trend,
    delay = 0
}: {
    icon: any;
    value: number;
    label: string;
    color: string;
    trend?: number;
    delay?: number;
}) {
    const colorClasses: Record<string, { bg: string; border: string; icon: string; text: string }> = {
        blue: { bg: "from-blue-500/20 to-blue-600/5", border: "border-blue-500/30", icon: "bg-blue-500/30 text-blue-400", text: "text-blue-300" },
        emerald: { bg: "from-emerald-500/20 to-emerald-600/5", border: "border-emerald-500/30", icon: "bg-emerald-500/30 text-emerald-400", text: "text-emerald-300" },
        amber: { bg: "from-amber-500/20 to-amber-600/5", border: "border-amber-500/30", icon: "bg-amber-500/30 text-amber-400", text: "text-amber-300" },
        purple: { bg: "from-purple-500/20 to-purple-600/5", border: "border-purple-500/30", icon: "bg-purple-500/30 text-purple-400", text: "text-purple-300" },
    }

    const c = colorClasses[color] || colorClasses.blue

    return (
        <Card
            className={`bg-gradient-to-br ${c.bg} ${c.border} border hover:scale-[1.02] transition-all duration-300 overflow-hidden relative group`}
            style={{ animationDelay: `${delay}ms` }}
        >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/5 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
            <CardContent className="p-6">
                <div className="flex items-start justify-between">
                    <div className={`w-14 h-14 rounded-2xl ${c.icon} flex items-center justify-center shadow-lg`}>
                        <Icon className="w-7 h-7" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {Math.abs(trend)}%
                        </div>
                    )}
                </div>
                <div className="mt-4">
                    <p className="text-4xl font-bold text-white tracking-tight">
                        <AnimatedCounter value={value} />
                    </p>
                    <p className={`text-sm font-medium ${c.text} mt-1`}>{label}</p>
                </div>
            </CardContent>
        </Card>
    )
}

// Chart Card Component
function ChartCard({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: any }) {
    return (
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-xl overflow-hidden group hover:border-slate-600/50 transition-all duration-300">
            <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-6">
                    {Icon && (
                        <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-slate-400" />
                        </div>
                    )}
                    <h3 className="text-lg font-bold text-white">{title}</h3>
                </div>
                <div className="h-64">
                    {children}
                </div>
            </CardContent>
        </Card>
    )
}

export default function ReportsPage() {
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [exporting, setExporting] = useState(false)
    const [refreshing, setRefreshing] = useState(false)

    useEffect(() => {
        fetchStats()
    }, [])

    async function fetchStats() {
        try {
            const res = await fetch("/api/admin/stats")
            if (res.ok) {
                const data = await res.json()
                setStats(data)
            }
        } catch (error) {
            console.error("Error fetching stats:", error)
        } finally {
            setLoading(false)
            setRefreshing(false)
        }
    }

    async function handleRefresh() {
        setRefreshing(true)
        await fetchStats()
    }

    async function exportToExcel() {
        if (!stats) return
        setExporting(true)
        try {
            const wb = XLSX.utils.book_new()

            const overview = [
                ["Metrik", "Değer"],
                ["Toplam Kullanıcı", stats.userCount],
                ["Toplam Ders", stats.courseCount],
                ["Toplam Sınav", stats.examCount],
                ["Toplam Dosya", stats.fileCount],
                ["Tamamlanan Sınavlar", stats.completedExams]
            ]
            const ws1 = XLSX.utils.aoa_to_sheet(overview)
            XLSX.utils.book_append_sheet(wb, ws1, "Genel Bakış")

            const usersByRole = [["Rol", "Sayı"], ...stats.usersByRole.map(r => [r.role, r.count])]
            const ws2 = XLSX.utils.aoa_to_sheet(usersByRole)
            XLSX.utils.book_append_sheet(wb, ws2, "Kullanıcılar")

            const filesByType = [["Tür", "Sayı"], ...stats.filesByType.map(f => [f.type, f.count])]
            const ws3 = XLSX.utils.aoa_to_sheet(filesByType)
            XLSX.utils.book_append_sheet(wb, ws3, "Dosyalar")

            const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" })
            const blob = new Blob([wbout], { type: "application/octet-stream" })
            saveAs(blob, `rapor-${new Date().toISOString().split("T")[0]}.xlsx`)
        } catch (error) {
            console.error("Export error:", error)
        } finally {
            setExporting(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center h-96 gap-4">
                <div className="relative">
                    <div className="w-16 h-16 rounded-full border-4 border-slate-700 animate-pulse" />
                    <Sparkles className="w-8 h-8 text-purple-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-spin" />
                </div>
                <p className="text-slate-400 font-medium">Veriler yükleniyor...</p>
            </div>
        )
    }

    const usersByRoleData = {
        labels: stats?.usersByRole?.map(r => r.role === "HOCA" ? "Öğretim Görevlisi" : r.role === "MUDUR" ? "Müdür" : "Müdür Yrd.") || [],
        datasets: [{
            data: stats?.usersByRole?.map(r => r.count) || [],
            backgroundColor: ["#3b82f6", "#8b5cf6", "#6366f1"]
        }]
    }

    const filesByTypeData = {
        labels: stats?.filesByType?.map(f => f.type === "BEST" ? "En İyi" : f.type === "AVERAGE" ? "Orta" : "En Düşük") || [],
        datasets: [{
            data: stats?.filesByType?.map(f => f.count) || [],
            backgroundColor: ["#10b981", "#f59e0b", "#ef4444"]
        }]
    }

    const monthlyData = {
        labels: stats?.monthlyUploads?.map(m => m.month) || [],
        datasets: [{
            label: "Yüklenen Dosya",
            data: stats?.monthlyUploads?.map(m => m.count) || [],
            backgroundColor: "rgba(99, 102, 241, 0.5)",
            borderColor: "#6366f1",
            borderWidth: 2,
            borderRadius: 8
        }]
    }

    const completionRate = stats?.examCount ? Math.round((stats.completedExams / stats.examCount) * 100) : 0

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 via-purple-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-purple-500/20">
                        <BarChart2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Raporlar & Analizler</h1>
                        <p className="text-slate-400 mt-1">Sistem performansı ve istatistikler</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="outline"
                        onClick={handleRefresh}
                        disabled={refreshing}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 gap-2"
                    >
                        <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                        Yenile
                    </Button>
                    <Button
                        onClick={exportToExcel}
                        disabled={exporting}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 gap-2 shadow-lg shadow-emerald-500/20"
                    >
                        {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
                        Excel&apos;e Aktar
                    </Button>
                </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard icon={Users} value={stats?.userCount || 0} label="Toplam Kullanıcı" color="blue" trend={12} delay={0} />
                <StatCard icon={BookOpen} value={stats?.courseCount || 0} label="Aktif Ders" color="emerald" trend={8} delay={100} />
                <StatCard icon={Calendar} value={stats?.examCount || 0} label="Kayıtlı Sınav" color="amber" trend={-3} delay={200} />
                <StatCard icon={FileText} value={stats?.fileCount || 0} label="Yüklenen Dosya" color="purple" trend={25} delay={300} />
            </div>

            {/* Completion Progress */}
            <Card className="bg-gradient-to-r from-slate-800/80 to-slate-800/40 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/30 to-emerald-600/20 flex items-center justify-center">
                                <TrendingUp className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Tamamlanma Oranı</h3>
                                <p className="text-slate-400 text-sm">{stats?.completedExams || 0} / {stats?.examCount || 0} sınav tamamlandı</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-4xl font-bold text-emerald-400">{completionRate}%</p>
                        </div>
                    </div>
                    <div className="h-4 bg-slate-700/50 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${completionRate}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 animate-shimmer" />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title="Kullanıcı Dağılımı" icon={Users}>
                    <PieChart data={usersByRoleData} />
                </ChartCard>

                <ChartCard title="Dosya Türleri" icon={FileText}>
                    <DoughnutChart data={filesByTypeData} />
                </ChartCard>

                <ChartCard title="Aylık Dosya Yüklemeleri" icon={Calendar}>
                    <BarChart data={monthlyData} />
                </ChartCard>

                <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-xl overflow-hidden">
                    <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                <Sparkles className="w-5 h-5 text-amber-400" />
                            </div>
                            <h3 className="text-lg font-bold text-white">Hızlı Özet</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                <span className="text-slate-300">Ortalama dosya/sınav</span>
                                <span className="text-2xl font-bold text-white">
                                    {stats?.examCount ? (stats.fileCount / stats.examCount).toFixed(1) : 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                <span className="text-slate-300">Ders başına sınav</span>
                                <span className="text-2xl font-bold text-white">
                                    {stats?.courseCount ? (stats.examCount / stats.courseCount).toFixed(1) : 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                                <span className="text-emerald-300">Tam dolu sınavlar</span>
                                <span className="text-2xl font-bold text-emerald-400">
                                    {stats?.completedExams || 0}
                                </span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
