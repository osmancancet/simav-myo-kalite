"use client"

import { useState } from "react"
import { Plus, BookOpen, Calendar, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface AddCourseModalProps {
    userId: string
    userName: string
    isOpen: boolean
    onClose: () => void
}

export function AddCourseModal({ userId, userName, isOpen, onClose }: AddCourseModalProps) {
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!code || !name) return

        setLoading(true)
        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, name, instructorId: userId })
            })

            if (res.ok) {
                setCode("")
                setName("")
                onClose()
                router.refresh()
            }
        } catch (error) {
            console.error("Course add error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center">
                            <BookOpen className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Ders Ekle</h3>
                            <p className="text-sm text-slate-400">{userName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ders Kodu</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            placeholder="örn: BİL101"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Ders Adı</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="örn: Programlamaya Giriş"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-slate-600 text-slate-300"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-blue-600 hover:bg-blue-700"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface AddExamModalProps {
    courseId: string
    courseName: string
    isOpen: boolean
    onClose: () => void
}

export function AddExamModal({ courseId, courseName, isOpen, onClose }: AddExamModalProps) {
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const router = useRouter()

    const examTypes = ["Vize", "Final", "Bütünleme", "Kısa Sınav", "Ödev"]

    if (!isOpen) return null

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!name) return

        setLoading(true)
        try {
            const res = await fetch("/api/exams", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, courseId })
            })

            if (res.ok) {
                setName("")
                onClose()
                router.refresh()
            }
        } catch (error) {
            console.error("Exam add error:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">Sınav Ekle</h3>
                            <p className="text-sm text-slate-400">{courseName}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-700">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Sınav Adı</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="örn: Vize"
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder:text-slate-500 focus:border-amber-500 focus:outline-none"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Hızlı Seçim</label>
                        <div className="flex flex-wrap gap-2">
                            {examTypes.map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setName(type)}
                                    className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${name === type
                                            ? "bg-amber-500 text-white"
                                            : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1 border-slate-600 text-slate-300"
                        >
                            İptal
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-amber-600 hover:bg-amber-700"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}

interface AdminAddButtonsProps {
    type: "course" | "exam"
    userId?: string
    userName?: string
    courseId?: string
    courseName?: string
}

export function AdminAddButton({ type, userId, userName, courseId, courseName }: AdminAddButtonsProps) {
    const [isOpen, setIsOpen] = useState(false)

    if (type === "course" && userId && userName) {
        return (
            <>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                    title="Ders Ekle"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <AddCourseModal
                    userId={userId}
                    userName={userName}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </>
        )
    }

    if (type === "exam" && courseId && courseName) {
        return (
            <>
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        setIsOpen(true)
                    }}
                    className="p-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 transition-colors"
                    title="Sınav Ekle"
                >
                    <Plus className="w-4 h-4" />
                </button>
                <AddExamModal
                    courseId={courseId}
                    courseName={courseName}
                    isOpen={isOpen}
                    onClose={() => setIsOpen(false)}
                />
            </>
        )
    }

    return null
}
