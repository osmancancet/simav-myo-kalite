"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"

// Simplified type for props
interface ArchiveFile {
    id: string
    filename: string
    type: string
    uploadedAt: Date
    deleteRequest?: any // null if no request
}

interface FileListProps {
    files: ArchiveFile[]
    label: string
}

export function FileList({ files, label }: FileListProps) {
    const router = useRouter() // Used for refreshing page after actions

    // TODO: Implement Delete Request Dialog
    const handleDeleteRequest = (fileId: string) => {
        // Open modal or navigate to request page
        alert("Silme talebi özelliği yakında eklenecek.")
    }

    if (files.length === 0) return null

    return (
        <div className="mt-4">
            <h3 className="text-sm font-semibold mb-2 text-gray-600">{label} Dosyaları ({files.length})</h3>
            <div className="space-y-2">
                {files.map((file) => (
                    <Card key={file.id} className="bg-white">
                        <CardContent className="p-3 flex items-center justify-between">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <FileText className="w-5 h-5 text-red-500 shrink-0" />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{file.filename}</p>
                                    <p className="text-xs text-gray-400">{new Date(file.uploadedAt).toLocaleDateString()}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                                {/* TODO: Download Link */}
                                <Button size="sm" variant="ghost" className="text-red-600 hover:text-red-700 hover:bg-red-50" onClick={() => handleDeleteRequest(file.id)}>
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
