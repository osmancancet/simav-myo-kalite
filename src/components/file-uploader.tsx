"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Upload, X } from "lucide-react"

interface FileUploaderProps {
    courseId: string
    type: "BEST" | "AVERAGE" | "WORST"
    label: string
    onUploadComplete: () => void
}

export function FileUploader({ courseId, type, label, onUploadComplete }: FileUploaderProps) {
    const [file, setFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0]
            if (selectedFile.type === "application/pdf") {
                setFile(selectedFile)
            } else {
                alert("Lütfen sadece PDF dosyası yükleyiniz.")
            }
        }
    }

    const handleUpload = async () => {
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append("file", file)
        formData.append("type", type)

        // Using fetch to call our API
        try {
            const res = await fetch(`/api/course/${courseId}/upload`, {
                method: "POST",
                body: formData,
            })

            if (!res.ok) throw new Error("Upload failed")

            setFile(null)
            onUploadComplete()
        } catch (error) {
            console.error(error)
            alert("Yükleme başarısız oldu.")
        } finally {
            setUploading(false)
        }
    }

    return (
        <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-slate-50">
            <div className="flex flex-col gap-2">
                <Label className="font-semibold text-gray-700">{label} Sınav Kağıdı Yükle</Label>
                {!file ? (
                    <div className="flex items-center gap-2">
                        <Input
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="cursor-pointer"
                        />
                    </div>
                ) : (
                    <div className="flex items-center justify-between bg-white p-2 border rounded text-sm">
                        <span className="truncate max-w-[200px]">{file.name}</span>
                        <div className="flex items-center gap-2">
                            <Button size="sm" onClick={handleUpload} disabled={uploading}>
                                {uploading ? "Yükleniyor..." : "Yükle"}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => setFile(null)} disabled={uploading}>
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
