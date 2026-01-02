"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useRef } from "react"
import { Award, BarChart2, TrendingDown, Upload, FileText, Clock, Trash2, CheckCircle2, XCircle, Loader2, AlertTriangle } from "lucide-react"
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
    { type: "BEST", label: "En İyi", icon: Award, color: "emerald", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-600" },
    { type: "AVERAGE", label: "Orta", icon: BarChart2, color: "amber", bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-600" },
    { type: "WORST", label: "En Düşük", icon: TrendingDown, color: "red", bgColor: "bg-red-50", borderColor: "border-red-200", textColor: "text-red-500" },
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
        <Card className="border-0 shadow-lg overflow-hidden">
            <div className="h-2 bg-[#1a365d]" />
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[#1a365d] flex items-center justify-center text-white font-bold text-sm">
                            {exam.name.charAt(0)}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">{exam.name}</h3>
                            {exam.semester && <p className="text-sm text-slate-500">{exam.semester}</p>}
                        </div>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(exam.createdAt).toLocaleDateString("tr-TR")}
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {/* Notification */}
                {notification && (
                    <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${notification.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
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
                                        <div className="flex items-center gap-2 p-2 bg-white rounded-lg">
                                            <FileText className={`w-4 h-4 ${ft.textColor}`} />
                                            <span className="text-sm text-slate-700 truncate flex-1">{existingFile.filename}</span>
                                        </div>
                                        {hasPendingRequest ? (
                                            <p className="text-xs text-amber-600 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> Silme talebi bekliyor
                                            </p>
                                        ) : (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="w-full text-slate-500 hover:text-red-600 hover:bg-red-50"
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
                                            className={`w-full border-dashed ${ft.borderColor} ${ft.textColor} hover:${ft.bgColor}`}
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
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-[#c53030]">
                            <AlertTriangle className="w-5 h-5" />
                            Silme Talebi
                        </DialogTitle>
                        <DialogDescription>
                            <strong>{selectedFile?.filename}</strong> dosyası için silme talebi gönderin.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label>Sebep Seçin</Label>
                        <div className="space-y-2">
                            {DELETE_REASONS.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${deleteReason === r.value
                                            ? "border-[#1a365d] bg-blue-50"
                                            : "border-slate-200 hover:border-slate-300"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="deleteReason"
                                        value={r.value}
                                        checked={deleteReason === r.value}
                                        onChange={(e) => setDeleteReason(e.target.value)}
                                    />
                                    <span className="text-sm">{r.label}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>İptal</Button>
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
        </Card>
    )
}
