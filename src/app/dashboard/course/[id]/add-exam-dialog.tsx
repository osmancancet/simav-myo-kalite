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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { Plus, Loader2, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"

const EXAM_TYPES = [
    { value: "Vize", label: "Vize" },
    { value: "Final", label: "Final" },
    { value: "Bütünleme", label: "Bütünleme" },
    { value: "Quiz", label: "Quiz" },
    { value: "Ödev", label: "Ödev" },
    { value: "Proje", label: "Proje" },
]

export function AddExamDialog({ courseId }: { courseId: string }) {
    const [open, setOpen] = useState(false)
    const [examName, setExamName] = useState("")
    const [semester, setSemester] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async () => {
        if (!examName.trim()) {
            setError("Sınav adı gereklidir")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId,
                    name: examName,
                    semester: semester || null
                })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Sınav eklenemedi")
            }

            setOpen(false)
            setExamName("")
            setSemester("")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="bg-white text-[#1a365d] hover:bg-white/90 gap-2 h-12 px-6 rounded-xl font-semibold">
                    <Plus className="w-5 h-5" />
                    Yeni Sınav Ekle
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-[#1a365d]">
                        <Calendar className="w-5 h-5" />
                        Yeni Sınav Ekle
                    </DialogTitle>
                    <DialogDescription>
                        Vize, Final, Bütünleme gibi sınavlar ekleyin.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {error && (
                        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label>Sınav Türü</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {EXAM_TYPES.map((type) => (
                                <button
                                    key={type.value}
                                    type="button"
                                    onClick={() => setExamName(type.value)}
                                    className={`p-3 rounded-xl border-2 text-sm font-medium transition-all ${examName === type.value
                                            ? "border-[#1a365d] bg-blue-50 text-[#1a365d]"
                                            : "border-slate-200 hover:border-slate-300"
                                        }`}
                                >
                                    {type.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="examName">veya Özel Sınav Adı</Label>
                        <Input
                            id="examName"
                            value={examName}
                            onChange={(e) => setExamName(e.target.value)}
                            placeholder="Örn: Quiz 2"
                            className="h-11"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="semester">Dönem (Opsiyonel)</Label>
                        <Input
                            id="semester"
                            value={semester}
                            onChange={(e) => setSemester(e.target.value)}
                            placeholder="Örn: 2024-2025 Güz"
                            className="h-11"
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                        İptal
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={loading || !examName.trim()}
                        className="bg-[#c53030] hover:bg-[#9b2c2c] gap-2"
                    >
                        {loading ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Ekleniyor...</>
                        ) : (
                            "Sınav Ekle"
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
