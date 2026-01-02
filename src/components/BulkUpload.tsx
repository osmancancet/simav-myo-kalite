"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Upload, FileText, CheckCircle, XCircle, Loader2, X } from "lucide-react"

interface BulkUploadProps {
    examId: string
    onComplete?: () => void
}

interface FileUpload {
    file: File
    type: "BEST" | "AVERAGE" | "WORST"
    grade?: number
    status: "pending" | "uploading" | "success" | "error"
    error?: string
}

export function BulkUpload({ examId, onComplete }: BulkUploadProps) {
    const [files, setFiles] = useState<FileUpload[]>([])
    const [uploading, setUploading] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || [])
        const pdfFiles = selectedFiles.filter(f => f.type === "application/pdf")

        if (pdfFiles.length !== selectedFiles.length) {
            alert("Sadece PDF dosyaları yüklenebilir!")
        }

        // Auto-assign types based on count
        const types: ("BEST" | "AVERAGE" | "WORST")[] = ["BEST", "AVERAGE", "WORST"]
        const newFiles: FileUpload[] = pdfFiles.map((file, i) => ({
            file,
            type: types[i % 3],
            status: "pending"
        }))

        setFiles(prev => [...prev, ...newFiles])
    }

    const updateFileType = (index: number, type: "BEST" | "AVERAGE" | "WORST") => {
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, type } : f))
    }

    const updateFileGrade = (index: number, grade: string) => {
        const gradeNum = parseInt(grade)
        setFiles(prev => prev.map((f, i) => i === index ? { ...f, grade: isNaN(gradeNum) ? undefined : gradeNum } : f))
    }

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index))
    }

    const uploadAll = async () => {
        setUploading(true)

        for (let i = 0; i < files.length; i++) {
            const fileUpload = files[i]

            setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "uploading" } : f))

            const formData = new FormData()
            formData.append("file", fileUpload.file)
            formData.append("type", fileUpload.type)
            formData.append("examId", examId)
            if (fileUpload.grade !== undefined) {
                formData.append("grade", fileUpload.grade.toString())
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

                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "success" } : f))
            } catch (error: any) {
                setFiles(prev => prev.map((f, idx) => idx === i ? { ...f, status: "error", error: error.message } : f))
            }
        }

        setUploading(false)
        onComplete?.()
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

    return (
        <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Toplu Dosya Yükleme</h3>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                        accept=".pdf,application/pdf"
                        multiple
                        className="hidden"
                    />
                    <Button
                        variant="outline"
                        className="gap-2 border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                    >
                        <Upload className="w-4 h-4" />
                        Dosya Seç
                    </Button>
                </div>

                {files.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-slate-600 rounded-xl">
                        <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                        <p className="text-slate-400">Birden fazla PDF dosyası seçin</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {files.map((fileUpload, index) => (
                            <div
                                key={index}
                                className={`flex items-center gap-4 p-4 rounded-xl border ${fileUpload.status === "success" ? "bg-emerald-500/10 border-emerald-500/30" :
                                        fileUpload.status === "error" ? "bg-red-500/10 border-red-500/30" :
                                            "bg-slate-700/30 border-slate-600/30"
                                    }`}
                            >
                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(fileUpload.type)}`}>
                                    {fileUpload.status === "uploading" ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : fileUpload.status === "success" ? (
                                        <CheckCircle className="w-5 h-5" />
                                    ) : fileUpload.status === "error" ? (
                                        <XCircle className="w-5 h-5" />
                                    ) : (
                                        <FileText className="w-5 h-5" />
                                    )}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-medium truncate">{fileUpload.file.name}</p>
                                    <p className="text-sm text-slate-400">
                                        {(fileUpload.file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    {fileUpload.error && (
                                        <p className="text-sm text-red-400">{fileUpload.error}</p>
                                    )}
                                </div>

                                {fileUpload.status === "pending" && (
                                    <>
                                        <select
                                            value={fileUpload.type}
                                            onChange={(e) => updateFileType(index, e.target.value as any)}
                                            className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                        >
                                            <option value="BEST">En İyi</option>
                                            <option value="AVERAGE">Orta</option>
                                            <option value="WORST">En Düşük</option>
                                        </select>
                                        <input
                                            type="number"
                                            placeholder="Not"
                                            min="0"
                                            max="100"
                                            className="w-20 bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                                            onChange={(e) => updateFileGrade(index, e.target.value)}
                                        />
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-400"
                                            onClick={() => removeFile(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </>
                                )}
                            </div>
                        ))}

                        <Button
                            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2 h-12"
                            onClick={uploadAll}
                            disabled={uploading || files.every(f => f.status !== "pending")}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Yükleniyor...
                                </>
                            ) : (
                                <>
                                    <Upload className="w-5 h-5" />
                                    Tümünü Yükle ({files.filter(f => f.status === "pending").length} dosya)
                                </>
                            )}
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
