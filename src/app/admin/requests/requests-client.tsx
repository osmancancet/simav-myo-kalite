"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    FileText, Clock, CheckCircle, XCircle, User, AlertTriangle,
    Sparkles, Calendar, BookOpen, Trash2, History, Eye, X
} from "lucide-react"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"

interface FileData {
    id: string
    filename: string
    type: string
    exam: {
        id: string
        name: string
        course: {
            id: string
            code: string
            instructor: {
                id: string
                name: string | null
            }
        }
    }
}

interface RequesterData {
    id: string
    name: string | null
}

interface DeleteRequest {
    id: string
    reason: string
    status: string
    rejectionReason: string | null
    createdAt: string
    file: FileData
    requester: RequesterData
}

interface DeleteRequestsClientProps {
    pendingRequests: DeleteRequest[]
    rejectedRequests: DeleteRequest[]
    approvedCount: number
    actions: React.ReactNode[]
}

const getTypeLabel = (type: string) => {
    switch (type) {
        case "BEST": return "En İyi"
        case "AVERAGE": return "Orta"
        case "WORST": return "En Düşük"
        default: return type
    }
}

const getTypeColor = (type: string) => {
    switch (type) {
        case "BEST": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        case "AVERAGE": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
        case "WORST": return "bg-red-500/20 text-red-400 border-red-500/30"
        default: return "bg-slate-500/20 text-slate-400"
    }
}

export function DeleteRequestsClient({ pendingRequests, rejectedRequests, approvedCount, actions }: DeleteRequestsClientProps) {
    const [showHistory, setShowHistory] = useState(false)
    const [selectedRequest, setSelectedRequest] = useState<DeleteRequest | null>(null)

    return (
        <div className="space-y-6">
            {/* Header with History Button */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-500 via-red-600 to-rose-600 flex items-center justify-center shadow-xl shadow-red-500/20">
                        <Trash2 className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Silme Talepleri</h1>
                        <p className="text-slate-400 mt-1">Eğitmenlerden gelen dosya silme taleplerini yönetin</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    onClick={() => setShowHistory(true)}
                    className="gap-2 border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white"
                >
                    <History className="w-4 h-4" />
                    Geçmiş ({approvedCount + rejectedRequests.length})
                </Button>
            </div>

            {/* Stats Cards - Compact */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-amber-500/20 to-amber-600/5 border-amber-500/30 hover:border-amber-400/50 transition-colors cursor-default">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-amber-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{pendingRequests.length}</p>
                                <p className="text-xs text-amber-300">Bekleyen</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30 hover:border-emerald-400/50 transition-colors cursor-default">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                <CheckCircle className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{approvedCount}</p>
                                <p className="text-xs text-emerald-300">Onaylanan</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-red-500/20 to-red-600/5 border-red-500/30 hover:border-red-400/50 transition-colors cursor-default">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-red-500/30 flex items-center justify-center">
                                <XCircle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-white">{rejectedRequests.length}</p>
                                <p className="text-xs text-red-300">Reddedilen</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Pending Requests */}
            {pendingRequests.length === 0 ? (
                <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                    <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-4">
                            <Sparkles className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Tüm talepler işlendi!</h3>
                        <p className="text-slate-400">Bekleyen silme talebi bulunmuyor</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4">
                    {pendingRequests.map((req, index) => (
                        <Card key={req.id} className="bg-slate-800/60 border-slate-700/50 backdrop-blur-xl overflow-hidden hover:border-amber-500/30 transition-all group">
                            <div className="h-1 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between gap-6">
                                    <div className="flex items-center gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                                            <AlertTriangle className="w-6 h-6 text-amber-400" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-white truncate">{req.file.filename}</h3>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTypeColor(req.file.type)}`}>
                                                    {getTypeLabel(req.file.type)}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                                <span className="flex items-center gap-1">
                                                    <BookOpen className="w-3.5 h-3.5" />
                                                    {req.file.exam.course.code}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="w-3.5 h-3.5" />
                                                    {req.file.exam.name}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <User className="w-3.5 h-3.5" />
                                                    {req.requester.name}
                                                </span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => setSelectedRequest(req)}
                                            className="text-slate-400 hover:text-white"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            Detay
                                        </Button>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        {actions[index]}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Request Detail Modal */}
            <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
                <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <FileText className="w-5 h-5 text-amber-400" />
                            Talep Detayı
                        </DialogTitle>
                    </DialogHeader>
                    {selectedRequest && (
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-700/30 rounded-xl">
                                <p className="text-sm text-slate-400 mb-1">Dosya</p>
                                <p className="text-white font-medium">{selectedRequest.file.filename}</p>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-slate-700/30 rounded-xl">
                                    <p className="text-sm text-slate-400 mb-1">Ders</p>
                                    <p className="text-white">{selectedRequest.file.exam.course.code}</p>
                                </div>
                                <div className="p-4 bg-slate-700/30 rounded-xl">
                                    <p className="text-sm text-slate-400 mb-1">Sınav</p>
                                    <p className="text-white">{selectedRequest.file.exam.name}</p>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-700/30 rounded-xl">
                                <p className="text-sm text-slate-400 mb-1">Talep Eden</p>
                                <p className="text-white">{selectedRequest.requester.name}</p>
                            </div>
                            <div className="p-4 bg-amber-500/10 rounded-xl border border-amber-500/30">
                                <p className="text-sm text-amber-300 mb-1">Silme Gerekçesi</p>
                                <p className="text-white">{selectedRequest.reason}</p>
                            </div>
                            <div className="p-4 bg-slate-700/30 rounded-xl">
                                <p className="text-sm text-slate-400 mb-1">Talep Tarihi</p>
                                <p className="text-white">{new Date(selectedRequest.createdAt).toLocaleString("tr-TR")}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* History Modal */}
            <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogContent className="sm:max-w-3xl bg-slate-800 border-slate-700 max-h-[80vh] overflow-hidden flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            <History className="w-5 h-5 text-blue-400" />
                            İşlenmiş Talepler Geçmişi
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                            Onaylanan ve reddedilen silme taleplerinin kaydı
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto -mx-6 px-6">
                        {rejectedRequests.length === 0 && approvedCount === 0 ? (
                            <div className="py-12 text-center">
                                <History className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">Henüz işlenmiş talep yok</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {/* Info about approved */}
                                {approvedCount > 0 && (
                                    <div className="p-4 bg-emerald-500/10 rounded-xl border border-emerald-500/30 flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                                        <span className="text-emerald-300">
                                            <strong>{approvedCount}</strong> talep onaylanarak dosyalar silindi
                                        </span>
                                    </div>
                                )}

                                {/* Rejected list */}
                                {rejectedRequests.map((req) => (
                                    <div key={req.id} className="p-4 bg-slate-700/30 rounded-xl border border-red-500/20">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <XCircle className="w-4 h-4 text-red-400" />
                                                    <span className="font-medium text-white truncate">{req.file.filename}</span>
                                                    <span className="text-xs text-red-400 bg-red-500/20 px-2 py-0.5 rounded">Reddedildi</span>
                                                </div>
                                                <div className="text-sm text-slate-400 mb-2">
                                                    {req.file.exam.course.code} - {req.file.exam.name} • {req.requester.name}
                                                </div>
                                                {req.rejectionReason && (
                                                    <div className="text-sm text-red-300 bg-red-500/10 p-2 rounded">
                                                        <span className="text-red-400">Gerekçe:</span> {req.rejectionReason}
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-xs text-slate-500">
                                                {new Date(req.createdAt).toLocaleDateString("tr-TR")}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
