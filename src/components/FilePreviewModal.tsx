"use client"

import { useState, useEffect } from "react"
import { X, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FilePreviewModalProps {
    isOpen: boolean
    onClose: () => void
    fileUrl: string
    fileName: string
}

export function FilePreviewModal({ isOpen, onClose, fileUrl, fileName }: FilePreviewModalProps) {
    const [loading, setLoading] = useState(true)
    const [zoom, setZoom] = useState(100)

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden"
            setLoading(true)
        } else {
            document.body.style.overflow = "auto"
        }
        return () => {
            document.body.style.overflow = "auto"
        }
    }, [isOpen])

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") onClose()
            if (e.key === "+" || e.key === "=") setZoom(z => Math.min(z + 25, 200))
            if (e.key === "-") setZoom(z => Math.max(z - 25, 50))
        }
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown)
        }
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [isOpen, onClose])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

            <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-slate-900 rounded-2xl overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-6 py-4 bg-slate-800 border-b border-slate-700">
                    <h3 className="font-bold text-white truncate max-w-md">{fileName}</h3>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoom(z => Math.max(z - 25, 50))}
                            className="text-slate-400 hover:text-white"
                        >
                            <ZoomOut className="w-5 h-5" />
                        </Button>
                        <span className="text-sm text-slate-400 w-12 text-center">{zoom}%</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setZoom(z => Math.min(z + 25, 200))}
                            className="text-slate-400 hover:text-white"
                        >
                            <ZoomIn className="w-5 h-5" />
                        </Button>

                        <div className="w-px h-6 bg-slate-700 mx-2" />

                        <a href={fileUrl} download={fileName} target="_blank">
                            <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                                <Download className="w-5 h-5" />
                            </Button>
                        </a>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onClose}
                            className="text-slate-400 hover:text-red-400"
                        >
                            <X className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-auto bg-slate-950 flex items-center justify-center p-4">
                    {loading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
                            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        </div>
                    )}
                    <iframe
                        src={`${fileUrl}#toolbar=0&navpanes=0&scrollbar=1`}
                        className="bg-white rounded-lg shadow-2xl"
                        style={{
                            width: `${zoom}%`,
                            height: "100%",
                            minHeight: "600px",
                            maxWidth: "100%"
                        }}
                        onLoad={() => setLoading(false)}
                    />
                </div>

                <div className="flex items-center justify-center gap-4 px-6 py-3 bg-slate-800 border-t border-slate-700 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-700">+/-</kbd> zoom
                    </span>
                    <span className="flex items-center gap-1">
                        <kbd className="px-1.5 py-0.5 rounded bg-slate-700">Esc</kbd> kapat
                    </span>
                </div>
            </div>
        </div>
    )
}
