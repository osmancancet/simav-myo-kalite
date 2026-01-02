"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Check, X, Loader2 } from "lucide-react"
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

const REJECTION_REASONS = [
    { value: "not_owner", label: "Dosyanın sahibi değilsiniz" },
    { value: "file_required", label: "Bu dosya kalite standartları için gereklidir" },
    { value: "wrong_request", label: "Talep gerekçesi uygun değil" },
    { value: "already_reviewed", label: "Dosya zaten incelenmiş ve onaylanmış" },
    { value: "other", label: "Diğer" },
]

export function DeleteRequestActions({ requestId }: { requestId: string }) {
    const [loading, setLoading] = useState<"approve" | "reject" | null>(null)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectionReason, setRejectionReason] = useState("")
    const [customReason, setCustomReason] = useState("")
    const router = useRouter()

    const handleApprove = async () => {
        setLoading("approve")

        try {
            const res = await fetch(`/api/delete-request/${requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "approve" })
            })

            if (!res.ok) {
                throw new Error("İşlem başarısız")
            }

            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(null)
        }
    }

    const handleReject = async () => {
        const finalReason = rejectionReason === "other"
            ? customReason
            : REJECTION_REASONS.find(r => r.value === rejectionReason)?.label || rejectionReason

        if (!finalReason) {
            return
        }

        setLoading("reject")

        try {
            const res = await fetch(`/api/delete-request/${requestId}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ action: "reject", rejectionReason: finalReason })
            })

            if (!res.ok) {
                throw new Error("İşlem başarısız")
            }

            setRejectDialogOpen(false)
            setRejectionReason("")
            setCustomReason("")
            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(null)
        }
    }

    const isRejectDisabled = !rejectionReason || (rejectionReason === "other" && !customReason.trim())

    return (
        <>
            <div className="flex flex-col gap-2">
                <Button
                    onClick={handleApprove}
                    disabled={loading !== null}
                    className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 gap-2 shadow-lg shadow-emerald-500/20 h-11 px-5"
                >
                    {loading === "approve" ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                    Onayla
                </Button>
                <Button
                    onClick={() => setRejectDialogOpen(true)}
                    disabled={loading !== null}
                    variant="outline"
                    className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 gap-2 h-11 px-5"
                >
                    <X className="w-4 h-4" />
                    Reddet
                </Button>
            </div>

            {/* Rejection Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-red-400">
                            <X className="w-5 h-5" />
                            Silme Talebini Reddet
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Talebi reddederken bir gerekçe belirtmeniz gerekmektedir. Bu gerekçe eğitmene bildirim olarak gönderilecektir.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2 py-4">
                        <Label className="text-slate-300">Red Gerekçesi</Label>
                        <div className="space-y-2">
                            {REJECTION_REASONS.map((r) => (
                                <label
                                    key={r.value}
                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${rejectionReason === r.value
                                        ? "border-red-500 bg-red-500/20"
                                        : "border-slate-600 hover:border-slate-500"
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="rejectionReason"
                                        value={r.value}
                                        checked={rejectionReason === r.value}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        className="accent-red-500"
                                    />
                                    <span className="text-sm text-slate-300">{r.label}</span>
                                </label>
                            ))}
                        </div>
                        {rejectionReason === "other" && (
                            <div className="mt-3">
                                <textarea
                                    placeholder="Özel red gerekçenizi yazın..."
                                    value={customReason}
                                    onChange={(e) => setCustomReason(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl bg-slate-700/50 border border-slate-600 text-white placeholder-slate-500 text-sm resize-none h-24"
                                />
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setRejectDialogOpen(false)
                                setRejectionReason("")
                                setCustomReason("")
                            }}
                            className="border-slate-600 text-slate-300"
                        >
                            İptal
                        </Button>
                        <Button
                            onClick={handleReject}
                            disabled={loading === "reject" || isRejectDisabled}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {loading === "reject" ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Reddet ve Bildir
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
