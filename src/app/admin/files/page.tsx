import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, Download, Trash2, Search, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"

export const dynamic = "force-dynamic"

export default async function FilesPage() {
    const files = await prisma.examFile.findMany({
        include: {
            exam: {
                include: {
                    course: {
                        include: { instructor: true }
                    }
                }
            }
        },
        orderBy: { uploadedAt: "desc" }
    })

    const getTypeColor = (type: string) => {
        switch (type) {
            case "BEST": return "bg-green-100 text-green-700"
            case "AVERAGE": return "bg-yellow-100 text-yellow-700"
            case "WORST": return "bg-red-100 text-red-700"
            default: return "bg-gray-100 text-gray-700"
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "BEST": return "En İyi"
            case "AVERAGE": return "Orta"
            case "WORST": return "En Düşük"
            default: return type
        }
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Dosya Yönetimi</h1>
                <p className="text-slate-500">Yüklenen tüm sınav kağıtlarını görüntüleyin</p>
            </div>

            <Card className="border-0 shadow-lg">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-slate-900 flex items-center gap-2">
                            <FileText className="w-5 h-5 text-purple-600" />
                            Tüm Dosyalar ({files.length})
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-200">
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Dosya</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Ders</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Eğitmen</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Tip</th>
                                    <th className="text-left py-3 px-4 text-sm font-medium text-slate-500">Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {files.map((file) => (
                                    <tr key={file.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${getTypeColor(file.type)}`}>
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <span className="font-medium text-slate-900 truncate max-w-xs">{file.filename}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className="font-medium text-slate-900">{file.exam.course.code}</span>
                                            <p className="text-xs text-slate-500">{file.exam.course.name}</p>
                                        </td>
                                        <td className="py-4 px-4 text-slate-600">
                                            {file.exam.course.instructor.name || file.exam.course.instructor.email}
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${getTypeColor(file.type)}`}>
                                                {getTypeLabel(file.type)}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4 text-slate-500 text-sm">
                                            {new Date(file.uploadedAt).toLocaleDateString("tr-TR")}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {files.length === 0 && (
                            <p className="text-center py-8 text-slate-400">Henüz dosya yüklenmemiş</p>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
