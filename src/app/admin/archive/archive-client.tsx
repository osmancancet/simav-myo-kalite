"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
    Archive, Download, Loader2, GraduationCap, FileText,
    FolderOpen, BookOpen, CheckCircle, Calendar
} from "lucide-react"

interface SemesterArchive {
    id: string
    name: string
    year: string
    term: string
    courseCount: number
    examCount: number
    fileCount: number
}

interface ArchiveClientProps {
    semesters: SemesterArchive[]
}

export function ArchiveClient({ semesters }: ArchiveClientProps) {
    const [downloading, setDownloading] = useState<string | null>(null)
    const [completed, setCompleted] = useState<string[]>([])

    const downloadArchive = async (semesterId: string, semesterName: string) => {
        setDownloading(semesterId)

        try {
            const res = await fetch(`/api/archive?semesterId=${semesterId}`)

            if (!res.ok) {
                throw new Error("Arşiv oluşturulamadı")
            }

            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement("a")
            a.href = url
            a.download = `arsiv-${semesterName.replace(/\s+/g, '-')}.zip`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            setCompleted(prev => [...prev, semesterId])
        } catch (error) {
            console.error("Download error:", error)
            alert("Arşiv indirilemedi!")
        } finally {
            setDownloading(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 flex items-center justify-center shadow-xl shadow-amber-500/20">
                    <Archive className="w-8 h-8 text-white" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Dönem Arşivi</h1>
                    <p className="text-slate-400 mt-1">Geçmiş dönemlerin dosyalarını indirin</p>
                </div>
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-blue-500/20 via-purple-500/10 to-indigo-500/20 border-blue-500/30">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <FolderOpen className="w-6 h-6 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white mb-2">Arşiv Nasıl Çalışır?</h3>
                            <p className="text-blue-300 text-sm">
                                Geçmiş dönemlerin tüm sınav dosyaları ZIP olarak indirilir.
                                Dosyalar ders kodlarına göre klasörlenmiştir.
                                Sadece aktif olmayan ve içinde veri bulunan dönemler listelenir.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Semester Cards */}
            {semesters.length === 0 ? (
                <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                    <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-10 h-10 text-amber-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz arşivlenecek dönem yok</h3>
                        <p className="text-slate-400">Aktif dönem tamamlandığında burada görünecek</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {semesters.map((semester) => {
                        const isDownloading = downloading === semester.id
                        const isCompleted = completed.includes(semester.id)

                        return (
                            <Card
                                key={semester.id}
                                className={`bg-slate-800/60 border-slate-700/50 backdrop-blur-xl overflow-hidden transition-all ${isCompleted ? "ring-2 ring-emerald-500/30" : ""
                                    }`}
                            >
                                <div className={`h-1.5 ${isCompleted
                                        ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                        : "bg-gradient-to-r from-amber-400 to-amber-500"
                                    }`} />
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isCompleted
                                                    ? "bg-emerald-500/20 text-emerald-400"
                                                    : "bg-amber-500/20 text-amber-400"
                                                }`}>
                                                {isCompleted ? (
                                                    <CheckCircle className="w-7 h-7" />
                                                ) : (
                                                    <GraduationCap className="w-7 h-7" />
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white">{semester.name}</h3>
                                                <p className="text-sm text-slate-400">
                                                    {semester.term === "GUZ" ? "Güz Dönemi" : "Bahar Dönemi"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 mb-4">
                                        <div className="text-center p-2 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                                <BookOpen className="w-3.5 h-3.5 text-blue-400" />
                                                <span className="text-lg font-bold text-white">{semester.courseCount}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Ders</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                                                <span className="text-lg font-bold text-white">{semester.examCount}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Sınav</p>
                                        </div>
                                        <div className="text-center p-2 rounded-xl bg-slate-700/30 border border-slate-600/30">
                                            <div className="flex items-center justify-center gap-1 mb-0.5">
                                                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                                                <span className="text-lg font-bold text-white">{semester.fileCount}</span>
                                            </div>
                                            <p className="text-xs text-slate-400">Dosya</p>
                                        </div>
                                    </div>

                                    <Button
                                        className={`w-full gap-2 h-11 ${isCompleted
                                                ? "bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30"
                                                : "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                                            }`}
                                        onClick={() => downloadArchive(semester.id, semester.name)}
                                        disabled={isDownloading}
                                    >
                                        {isDownloading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Hazırlanıyor...
                                            </>
                                        ) : isCompleted ? (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                İndirildi
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4" />
                                                ZIP İndir
                                            </>
                                        )}
                                    </Button>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
