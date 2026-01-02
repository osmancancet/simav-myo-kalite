"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Plus, MoreVertical, CheckCircle, Trash2, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Label } from "@/components/ui/label"

interface SemesterActionsProps {
    type: "create" | "manage"
    semesterId?: string
    isActive?: boolean
    variant?: "default" | "primary"
}

const TERMS = [
    { value: "GUZ", label: "Güz Dönemi" },
    { value: "BAHAR", label: "Bahar Dönemi" },
]

export function SemesterActions({ type, semesterId, isActive, variant = "default" }: SemesterActionsProps) {
    const [createOpen, setCreateOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [year, setYear] = useState("")
    const [term, setTerm] = useState("BAHAR")
    const router = useRouter()

    const currentYear = new Date().getFullYear()
    const yearOptions = [
        `${currentYear - 1}-${currentYear}`,
        `${currentYear}-${currentYear + 1}`,
        `${currentYear + 1}-${currentYear + 2}`,
    ]

    const handleCreate = async () => {
        if (!year || !term) return

        setLoading(true)
        try {
            const name = `${year} ${term === "GUZ" ? "Güz" : "Bahar"}`
            const res = await fetch("/api/admin/semesters", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, year, term })
            })

            if (!res.ok) {
                const data = await res.json()
                alert(data.error || "Hata oluştu")
                return
            }

            setCreateOpen(false)
            setYear("")
            setTerm("BAHAR")
            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleSetActive = async () => {
        if (!semesterId) return

        setLoading(true)
        try {
            const res = await fetch(`/api/admin/semesters/${semesterId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ isActive: true })
            })

            if (!res.ok) {
                alert("Hata oluştu")
                return
            }

            router.refresh()
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    if (type === "create") {
        return (
            <>
                <Button
                    onClick={() => setCreateOpen(true)}
                    className={variant === "primary"
                        ? "bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 gap-2"
                        : "bg-slate-700 hover:bg-slate-600 gap-2"
                    }
                >
                    <Plus className="w-4 h-4" />
                    Yeni Dönem
                </Button>

                <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                    <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                        <DialogHeader>
                            <DialogTitle className="text-white">Yeni Dönem Oluştur</DialogTitle>
                            <DialogDescription className="text-slate-400">
                                Akademik yıl ve dönem bilgilerini girin
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div>
                                <Label className="text-slate-300">Akademik Yıl</Label>
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                    {yearOptions.map((y) => (
                                        <button
                                            key={y}
                                            onClick={() => setYear(y)}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${year === y
                                                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                                    : "border-slate-600 text-slate-400 hover:border-slate-500"
                                                }`}
                                        >
                                            {y}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <Label className="text-slate-300">Dönem</Label>
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {TERMS.map((t) => (
                                        <button
                                            key={t.value}
                                            onClick={() => setTerm(t.value)}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${term === t.value
                                                    ? "border-violet-500 bg-violet-500/20 text-violet-300"
                                                    : "border-slate-600 text-slate-400 hover:border-slate-500"
                                                }`}
                                        >
                                            {t.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {year && term && (
                                <div className="p-4 bg-slate-700/30 rounded-xl">
                                    <p className="text-sm text-slate-400">Oluşturulacak Dönem:</p>
                                    <p className="text-lg font-bold text-white mt-1">
                                        {year} {term === "GUZ" ? "Güz" : "Bahar"}
                                    </p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setCreateOpen(false)} className="border-slate-600">
                                İptal
                            </Button>
                            <Button
                                onClick={handleCreate}
                                disabled={loading || !year || !term}
                                className="bg-violet-600 hover:bg-violet-700"
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                                Oluştur
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </>
        )
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white">
                    <MoreVertical className="w-5 h-5" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700">
                {!isActive && (
                    <DropdownMenuItem
                        onClick={handleSetActive}
                        className="text-emerald-400 focus:text-emerald-300 cursor-pointer"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Aktif Yap
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
