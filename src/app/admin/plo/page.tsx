"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Plus, Trash2, X, Loader2, BookOpen, ChevronRight } from "lucide-react"

interface PLO {
    id: string
    code: string
    description: string
    courses: { course: { code: string; name: string } }[]
}

export default function PLOPage() {
    const [plos, setPlos] = useState<PLO[]>([])
    const [loading, setLoading] = useState(true)
    const [showModal, setShowModal] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState({ code: "", description: "" })

    useEffect(() => {
        fetchPLOs()
    }, [])

    async function fetchPLOs() {
        setLoading(true)
        try {
            const res = await fetch("/api/plo")
            if (res.ok) {
                const data = await res.json()
                setPlos(data)
            }
        } catch (error) {
            console.error("Error fetching PLOs:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch("/api/plo", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setShowModal(false)
                setFormData({ code: "", description: "" })
                fetchPLOs()
            }
        } catch (error) {
            console.error("Error creating PLO:", error)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm("Bu program çıktısını silmek istediğinize emin misiniz?")) return
        try {
            const res = await fetch(`/api/plo?id=${id}`, { method: "DELETE" })
            if (res.ok) fetchPLOs()
        } catch (error) {
            console.error("Error deleting PLO:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-96">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center">
                        <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Program Çıktıları</h1>
                        <p className="text-slate-400">YÖKAK uyumlu program çıktılarını yönetin</p>
                    </div>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-[#c53030] hover:bg-[#9b2c2c] gap-2">
                    <Plus className="w-4 h-4" /> Yeni PÇ Ekle
                </Button>
            </div>

            {/* PLO List */}
            <div className="space-y-4">
                {plos.length === 0 ? (
                    <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                        <CardContent className="py-16 text-center">
                            <Award className="w-16 h-16 mx-auto mb-4 text-slate-600" />
                            <h3 className="text-xl font-bold text-white mb-2">Henüz program çıktısı eklenmemiş</h3>
                            <p className="text-slate-400 mb-6">Program çıktıları ekleyerek YÖKAK uyumluluğunu sağlayın</p>
                            <Button onClick={() => setShowModal(true)} className="bg-[#c53030] hover:bg-[#9b2c2c] gap-2">
                                <Plus className="w-4 h-4" /> İlk PÇ'yi Ekle
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    plos.map((plo) => (
                        <Card key={plo.id} className="bg-slate-800/50 border-slate-700/50 hover:border-amber-500/30 transition-colors">
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white font-bold shrink-0">
                                        {plo.code}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-white mb-2">{plo.description}</p>
                                        {plo.courses.length > 0 && (
                                            <div className="flex flex-wrap gap-2">
                                                {plo.courses.slice(0, 5).map((c, i) => (
                                                    <span key={i} className="px-2 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-300">
                                                        {c.course.code}
                                                    </span>
                                                ))}
                                                {plo.courses.length > 5 && (
                                                    <span className="px-2 py-1 rounded-lg bg-slate-700/50 text-xs text-slate-400">
                                                        +{plo.courses.length - 5} ders
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {plo.courses.length === 0 && (
                                            <p className="text-sm text-slate-500">Henüz ders eşleştirilmemiş</p>
                                        )}
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(plo.id)}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {/* Info Card */}
            <Card className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
                <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                            <BookOpen className="w-6 h-6 text-amber-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white mb-2">Program Çıktıları Nedir?</h3>
                            <p className="text-slate-300 text-sm">
                                Program çıktıları (PÇ), öğrencilerin mezun olduklarında sahip olması beklenen bilgi,
                                beceri ve yetkinlikleri tanımlar. YÖKAK akreditasyonu için her ders ile program
                                çıktıları arasındaki ilişki belirlenmelidir.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Yeni Program Çıktısı</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Kod</label>
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                                        placeholder="PÇ1"
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Açıklama</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        placeholder="Öğrenci, alanındaki temel kavramları ve teorileri açıklayabilir."
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                        rows={4}
                                        required
                                    />
                                </div>
                                <div className="flex gap-3">
                                    <Button type="button" variant="ghost" className="flex-1" onClick={() => setShowModal(false)}>
                                        İptal
                                    </Button>
                                    <Button type="submit" className="flex-1 bg-[#c53030] hover:bg-[#9b2c2c]" disabled={saving}>
                                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
