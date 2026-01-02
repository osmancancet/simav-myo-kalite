"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useRef } from "react"
import { Award, BarChart2, TrendingDown, Upload, FileText, Clock, Trash2, CheckCircle2, XCircle, Loader2, AlertTriangle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

interface ExamFile {
    id: string
    type: string
    filename: string
    path: string
    grade: number | null
    uploadedAt: Date
    deleteRequest: { status: string } | null
}

interface ExamCardProps {
    exam: {
        id: string
        name: string
        semester: string | null
        createdAt: Date
        files: ExamFile[]
    }
    courseCode: string
}

const FILE_TYPES = [
    { type: "BEST", label: "En İyi", icon: Award, bgColor: "bg-emerald-500/20", borderColor: "border-emerald-500/30", textColor: "text-emerald-400" },
    { type: "AVERAGE", label: "Orta", icon: BarChart2, bgColor: "bg-amber-500/20", borderColor: "border-amber-500/30", textColor: "text-amber-400" },
    { type: "WORST", label: "En Düşük", icon: TrendingDown, bgColor: "bg-red-500/20", borderColor: "border-red-500/30", textColor: "text-red-400" },
]

const DELETE_REASONS = [
    { value: "wrong_file", label: "Yanlış Dosya Yüklendi" },
    { value: "unreadable", label: "Okunaksız Tarama" },
    { value: "wrong_category", label: "Yanlış Kategori Seçildi" },
    { value: "duplicate", label: "Aynı Dosya Tekrar Yüklendi" },
    { value: "other", label: "Diğer" },
]

export function ExamCard({ exam, courseCode }: ExamCardProps) {
    const [uploading, setUploading] = useState<string | null>(null)
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [selectedFile, setSelectedFile] = useState<ExamFile | null>(null)
    const [deleteReason, setDeleteReason] = useState("")
    const [deleting, setDeleting] = useState(false)
    const [gradeInput, setGradeInput] = useState<{ [key: string]: string }>({})
    const [previewFile, setPreviewFile] = useState<ExamFile | null>(null)
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({})
    const router = useRouter()

    const getFileByType = (type: string) => exam.files.find(f => f.type === type)

    const handleFileUpload = async (type: string, file: File) => {
        if (file.type !== "application/pdf") {
            setNotification({ type: "error", message: "Sadece PDF dosyaları yüklenebilir!" })
            setTimeout(() => setNotification(null), 3000)
            return
        }

        setUploading(type)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)
        formData.append("examId", exam.id)
        // Add grade if provided
        const grade = gradeInput[type]
        if (grade && !isNaN(parseInt(grade))) {
            formData.append("grade", grade)
        }

        try {
            const res = await fetch("/api/files/upload", {
                method: "POST",
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Yükleme başarısız")
            }

            setNotification({ type: "success", message: "Dosya yüklendi!" })
            router.refresh()
        } catch (err: any) {
            setNotification({ type: "error", message: err.message })
        } finally {
            setUploading(null)
            setTimeout(() => setNotification(null), 3000)
        }
    }

    const handleDeleteRequest = async () => {
        if (!selectedFile || !deleteReason) return

        setDeleting(true)
        try {
            const finalReason = DELETE_REASONS.find(r => r.value === deleteReason)?.label || deleteReason

            const res = await fetch("/api/delete-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: selectedFile.id, reason: finalReason })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Talep gönderilemedi")
            }

            setDeleteDialogOpen(false)
            setSelectedFile(null)
            setDeleteReason("")
            router.refresh()
        } catch (err: any) {
            setNotification({ type: "error", message: err.message })
        } finally {
            setDeleting(false)
        }
    }

    return (
        <Card className="bg-slate-800/50 border-slate-700/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-slate-700/50">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 font-bold text-sm">
                            {exam.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">{exam.name}</h3>
                            {exam.semester && <p className="text-sm text-slate-400">{exam.semester}</p>}
                        </div>
                    </div>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(exam.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
                {/* Notification */}
                {notification && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${notification.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                        {notification.type === "success" ? <CheckCircle2 className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {notification.message}
                    </div>
                )}

                {/* File Slots */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FILE_TYPES.map((ft) => {
                        const existingFile = getFileByType(ft.type)
                        const hasPendingRequest = existingFile?.deleteRequest?.status === "PENDING"
                        const Icon = ft.icon

                        return (
                            <div
                                key={ft.type}
                                className={`p-4 rounded-xl border-2 ${ft.borderColor} ${ft.bgColor} transition-all`}
                            >
                                <div className="flex items-center gap-2 mb-3">
                                    <Icon className={`w-5 h-5 ${ft.textColor}`} />
                                    <span className={`font-semibold ${ft.textColor}`}>{ft.label}</span>
                                </div>

                                {existingFile ? (
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2 p-2 bg-slate-700/50 rounded-lg">
                                            <FileText className={`w-4 h-4 ${ft.textColor}`} />
                                            <span className="text-sm text-slate-300 truncate flex-1">{existingFile.filename}</span>
                                        </div>
                                        {/* Grade Display */}
                                        {existingFile.grade !== null && (
                                            <div className="text-center py-2 bg-slate-700/30 rounded-lg">
                                                <span className="text-lg font-bold text-white">{existingFile.grade}</span>
                                                <span className="text-sm text-slate-400"> puan</span>
                                            </div>
                                        )}
                                        {/* Preview Button */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className={`w-full ${ft.textColor} hover:bg-slate-700/50`}
                                            onClick={() => setPreviewFile(existingFile)}
                                        >
                                            <Eye className="w-4 h-4 mr-2" />
                                            Ön İzle
                                        </Button>
                                        {hasPendingRequest ? (
                                            <p className="text-xs text-amber-400 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Silme talebi bekliyor
                                            </p>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-slate-400 hover:text-red-400 hover:bg-red-500/10"
                                                onClick={() => {
                                                    setSelectedFile(existingFile)
                                                    setDeleteDialogOpen(true)
                                                }}
                                            >
                                                <Trash2 className="w-4 h-4 mr-2" />
                                                Silme Talebi
                                            </Button>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        {/* Grade Input */}
                                        <div className="mb-2">
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                placeholder="Not (0-100)"
                                                value={gradeInput[ft.type] || ""}
                                                onChange={(e) => setGradeInput({ ...gradeInput, [ft.type]: e.target.value })}
                                                className="w-full px-3 py-2 rounded-lg bg-slate-700/50 border border-slate-600 text-white text-sm placeholder-slate-400"
                                            />
                                        </div>
                                        <input
                                            type="file"
                                            accept=".pdf,application/pdf"
                                            className="hidden"
                                            ref={(el) => { fileInputRefs.current[ft.type] = el }}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0]
                                                if (file) handleFileUpload(ft.type, file)
                                            }}
                                        />
                                        <Button
                                            variant="outline"
                                            className={`w-full border-dashed ${ft.borderColor} ${ft.textColor} bg-transparent hover:bg-slate-700/30`}
                                            onClick={() => fileInputRefs.current[ft.type]?.click()}
                                            disabled={uploading === ft.type}
                                        >
                                            {uploading === ft.type ? (
                                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Yükleniyor...</>
                                            ) : (
                                                <><Upload className="w-4 h-4 mr-2" /> PDF Yükle</>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        )
                    })}
                </div>
            </CardContent>

            {/* Delete Dialog */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#c53030]">
                            <AlertTriangle className="w-5 h-5" />
                            Silme Talebi
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            <strong className="text-slate-300">{selectedFile?.filename}</strong> dosyası için silme talebi gönderin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label className="text-slate-300">Sebep Seçin</Label>
                        <div className="space-y-2">
                            {DELETE_REASONS.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deleteReason === r.value
                                        ? "border-blue-500 bg-blue-500/20"
                                        : "border-slate-600 hover:border-slate-500"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="deleteReason"
                                        value={r.value}
                                        checked={deleteReason === r.value}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                        className="accent-blue-500"
                                    />
                                    <span className="text-sm text-slate-300">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)} className="border-slate-600 text-slate-300">İptal</Button>
                        <Button
                            onClick={handleDeleteRequest}
                            disabled={deleting || !deleteReason}
                            className="bg-[#c53030] hover:bg-[#9b2c2c]"
                        >
                            {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Talep Gönder"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* PDF Preview Dialog */}
            <Dialog open={!!previewFile} onOpenChange={() => setPreviewFile(null)}>
                <DialogContent className="max-w-4xl h-[80vh] bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <Eye className="w-5 h-5 text-blue-400" />
                            Dosya Önizleme
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            <strong className="text-slate-300">{previewFile?.filename}</strong>
                            {previewFile?.grade !== null && (
                                <span className="ml-2 px-2 py-1 rounded bg-slate-700 text-white">
                                    Not: {previewFile?.grade}
                                </span>
                            )}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 min-h-0 mt-4">
                        {previewFile && (
                            <iframe
                                src={`/api/files/${previewFile.path.replace(/\\/g, '/')}`}
                                className="w-full h-full rounded-lg border border-slate-700"
                                title="PDF Preview"
                            />
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </Card>
    )
}
