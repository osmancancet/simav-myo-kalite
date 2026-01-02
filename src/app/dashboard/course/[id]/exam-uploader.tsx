"use client"

import { Button } from "@/components/ui/button"
import { useState, useRef } from "react"
import { Upload, FileText, CheckCircle2, XCircle, Loader2, AlertTriangle, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface ExamUploaderProps {
    courseId: string
}

export function ExamUploader({ courseId }: ExamUploaderProps) {
    const [selectedType, setSelectedType] = useState<"BEST" | "AVERAGE" | "WORST" | null>(null)
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null)
    const [dragOver, setDragOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    const typeOptions = [
        {
            value: "BEST",
            label: "En İyi",
            description: "Yüksek puan almış kağıt",
            selectedBg: "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20",
            icon: "🏆"
        },
        {
            value: "AVERAGE",
            label: "Orta",
            description: "Ortalama not kağıdı",
            selectedBg: "bg-amber-50 border-amber-500 ring-2 ring-amber-500/20",
            icon: "📊"
        },
        {
            value: "WORST",
            label: "En Düşük",
            description: "Düşük puan almış kağıt",
            selectedBg: "bg-red-50 border-red-500 ring-2 ring-red-500/20",
            icon: "📉"
        },
    ]

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        setDragOver(false)
        const droppedFile = e.dataTransfer.files[0]
        validateAndSetFile(droppedFile)
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0]
        if (selectedFile) {
            validateAndSetFile(selectedFile)
        }
    }

    const validateAndSetFile = (selectedFile: File) => {
        if (selectedFile.type !== "application/pdf") {
            setNotification({ type: "error", message: "Sadece PDF dosyaları yüklenebilir!" })
            setTimeout(() => setNotification(null), 5000)
            return
        }
        if (selectedFile.size > 10 * 1024 * 1024) {
            setNotification({ type: "warning", message: "Dosya boyutu 10MB'dan küçük olmalıdır." })
            setTimeout(() => setNotification(null), 5000)
            return
        }
        setFile(selectedFile)
    }

    const handleUpload = async () => {
        if (!file || !selectedType) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", selectedType)

        try {
            const res = await fetch(`/api/course/${courseId}/upload`, {
                method: "POST",
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Yükleme başarısız")
            }

            setNotification({ type: "success", message: "Sınav kağıdı başarıyla yüklendi!" })
            setFile(null)
            setSelectedType(null)
            router.refresh()
        } catch (err: any) {
            setNotification({ type: "error", message: err.message })
        } finally {
            setUploading(false)
            setTimeout(() => setNotification(null), 5000)
        }
    }

    return (
        <div className="space-y-6">
            {/* Notification */}
            {notification && (
                <div className={`flex items-center gap-3 px-5 py-4 rounded-xl shadow-lg ${notification.type === "success"
                        ? "bg-emerald-500 text-white"
                        : notification.type === "warning"
                            ? "bg-amber-500 text-white"
                            : "bg-[#c53030] text-white"
                    }`}>
                    {notification.type === "success" ? (
                        <CheckCircle2 className="w-6 h-6" />
                    ) : notification.type === "warning" ? (
                        <AlertTriangle className="w-6 h-6" />
                    ) : (
                        <XCircle className="w-6 h-6" />
                    )}
                    <span className="font-medium flex-1">{notification.message}</span>
                    <button onClick={() => setNotification(null)} className="hover:opacity-70">
                        <XCircle className="w-5 h-5" />
                    </button>
                </div>
            )}

            {/* Type Selection */}
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1a365d] text-white text-xs flex items-center justify-center">1</span>
                    Sınav Kağıdı Türünü Seçin
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {typeOptions.map((option) => (
                        <button
                            key={option.value}
                            onClick={() => setSelectedType(option.value as any)}
                            className={`p-5 rounded-xl text-left transition-all border-2 ${selectedType === option.value
                                    ? option.selectedBg
                                    : "bg-white border-slate-200 hover:border-slate-300 hover:shadow-md"
                                }`}
                        >
                            <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{option.icon}</span>
                                <span className="font-bold text-slate-800">{option.label}</span>
                            </div>
                            <p className="text-sm text-slate-500">{option.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* File Upload */}
            <div>
                <p className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-[#1a365d] text-white text-xs flex items-center justify-center">2</span>
                    PDF Dosyasını Yükleyin
                </p>
                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${dragOver
                            ? "border-[#1a365d] bg-blue-50"
                            : file
                                ? "border-emerald-400 bg-emerald-50"
                                : "border-slate-300 bg-white hover:border-[#1a365d] hover:bg-slate-50"
                        }`}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".pdf,application/pdf"
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    {file ? (
                        <div className="flex items-center justify-center gap-4">
                            <div className="w-16 h-16 rounded-xl bg-emerald-100 flex items-center justify-center">
                                <FileText className="w-8 h-8 text-emerald-600" />
                            </div>
                            <div className="text-left">
                                <p className="font-semibold text-emerald-700 text-lg">{file.name}</p>
                                <p className="text-emerald-600">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFile(null) }}
                                className="ml-4 p-2 rounded-full bg-slate-100 text-slate-500 hover:bg-red-100 hover:text-red-500 transition-colors"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="w-20 h-20 rounded-2xl bg-[#1a365d]/10 flex items-center justify-center mx-auto mb-4">
                                <Upload className="w-10 h-10 text-[#1a365d]" />
                            </div>
                            <p className="text-slate-700 font-semibold text-lg">PDF dosyasını sürükleyin</p>
                            <p className="text-slate-500 mt-1">veya dosya seçmek için tıklayın</p>
                            <p className="text-slate-400 text-sm mt-3">Maksimum 10MB • Sadece PDF</p>
                        </>
                    )}
                </div>

                {/* Warning */}
                <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <div className="flex items-start gap-3">
                        <Eye className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-700">
                            <strong>Tarama İpucu:</strong> Yükleme öncesi dosyanızı kontrol edin. İyi aydınlatma ve düzgün açı ile yapılan taramalar daha kaliteli sonuç verir.
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Button */}
            <Button
                onClick={handleUpload}
                disabled={!file || !selectedType || uploading}
                className={`w-full h-14 font-semibold text-lg gap-3 rounded-xl shadow-lg transition-all ${file && selectedType
                        ? "bg-[#c53030] hover:bg-[#9b2c2c]"
                        : "bg-slate-300"
                    }`}
            >
                {uploading ? (
                    <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        Yükleniyor...
                    </>
                ) : (
                    <>
                        <Upload className="w-6 h-6" />
                        Sınav Kağıdını Yükle
                    </>
                )}
            </Button>
        </div>
    )
}
