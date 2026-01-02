"use client"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { FileText, Trash2, Download, Clock, XCircle, Loader2, AlertTriangle } from "lucide-react"
import { useRouter } from "next/navigation"

interface FileCardProps {
    file: {
        id: string
        filename: string
        type: string
        uploadedAt: Date
        path: string
        deleteRequest: {
            id: string
            status: string
            reason: string
        } | null
    }
}

const DELETE_REASONS = [
    { value: "wrong_file", label: "Yanlış Dosya Yüklendi" },
    { value: "unreadable", label: "Okunaksız Tarama" },
    { value: "wrong_category", label: "Yanlış Kategori Seçildi" },
    { value: "duplicate", label: "Aynı Dosya Tekrar Yüklendi" },
    { value: "outdated", label: "Eski/Güncel Olmayan Dosya" },
    { value: "other", label: "Diğer (Açıklama Gerekli)" },
]

export function FileCard({ file }: FileCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleDeleteRequest = async () => {
        const finalReason = reason === "other"
            ? customReason
            : DELETE_REASONS.find(r => r.value === reason)?.label || reason

        if (!finalReason.trim()) {
            setError("Lütfen silme sebebini seçin veya yazın.")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/delete-request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ fileId: file.id, reason: finalReason })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "İşlem başarısız")
            }

            setDialogOpen(false)
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const hasPendingRequest = file.deleteRequest?.status === "PENDING"
    const hasRejectedRequest = file.deleteRequest?.status === "REJECTED"

    return (
        <div className={`group flex items-center gap-4 p-4 rounded-xl border transition-all ${hasPendingRequest
                ? "bg-amber-50 border-amber-200"
                : hasRejectedRequest
                    ? "bg-red-50 border-red-200"
                    : "bg-white border-slate-200 hover:border-[#1a365d]/30 hover:shadow-lg"
            }`}>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${file.type === "BEST" ? "bg-emerald-100" :
                    file.type === "AVERAGE" ? "bg-amber-100" : "bg-red-100"
                }`}>
                <FileText className={`w-6 h-6 ${file.type === "BEST" ? "text-emerald-600" :
                        file.type === "AVERAGE" ? "text-amber-600" : "text-red-500"
                    }`} />
            </div>

            <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-900 truncate">{file.filename}</p>
                <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(file.uploadedAt).toLocaleDateString("tr-TR")}
                    </span>
                    {hasPendingRequest && (
                        <span className="text-xs text-amber-600 font-medium flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Silme Talebi Bekliyor
                        </span>
                    )}
                    {hasRejectedRequest && (
                        <span className="text-xs text-red-600 font-medium flex items-center gap-1">
                            <XCircle className="w-3 h-3" />
                            Talep Reddedildi
                        </span>
                    )}
                </div>
            </div>

            <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-[#1a365d] hover:bg-blue-50">
                    <Download className="w-5 h-5" />
                </Button>

                {!hasPendingRequest && (
                    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-[#c53030] hover:bg-red-50">
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-[#c53030]">
                                    <AlertTriangle className="w-5 h-5" />
                                    Silme Talebi Gönder
                                </DialogTitle>
                                <DialogDescription>
                                    <strong>{file.filename}</strong> dosyası için silme talebi oluşturun. Yönetici onayından sonra dosya silinecektir.
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 py-4">
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label>Silme Sebebi</Label>
                                    <div className="space-y-2">
                                        {DELETE_REASONS.map((r) => (
                                            <label
                                                key={r.value}
                                                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${reason === r.value
                                                        ? "border-[#1a365d] bg-blue-50"
                                                        : "border-slate-200 hover:border-slate-300"
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="reason"
                                                    value={r.value}
                                                    checked={reason === r.value}
                                                    onChange={(e) => setReason(e.target.value)}
                                                    className="w-4 h-4 text-[#1a365d]"
                                                />
                                                <span className="text-sm text-slate-700">{r.label}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>

                                {reason === "other" && (
                                    <div className="space-y-2">
                                        <Label htmlFor="customReason">Açıklama</Label>
                                        <textarea
                                            id="customReason"
                                            value={customReason}
                                            onChange={(e) => setCustomReason(e.target.value)}
                                            placeholder="Silme sebebini açıklayın..."
                                            className="w-full h-24 px-3 py-2 border rounded-xl resize-none focus:ring-2 focus:ring-[#1a365d] focus:border-transparent"
                                        />
                                    </div>
                                )}
                            </div>

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                                    İptal
                                </Button>
                                <Button
                                    onClick={handleDeleteRequest}
                                    disabled={loading || !reason}
                                    className="bg-[#c53030] hover:bg-[#9b2c2c] gap-2"
                                >
                                    {loading ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Gönderiliyor...</>
                                    ) : (
                                        "Talep Gönder"
                                    )}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </div>
    )
}
