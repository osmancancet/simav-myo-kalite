"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Loader2, BookOpen, ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function HocaDersEkle() {
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!code.trim() || !name.trim()) {
            setError("Tüm alanları doldurun")
            return
        }

        setLoading(true)
        setError("")

        try {
            const res = await fetch("/api/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: code.toUpperCase(), name })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Ders eklenemedi")
            }

            router.push("/hoca/derslerim")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href="/hoca">
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl">
                        <ArrowLeft className="w-5 h-5" />
                    </Button>
                </Link>
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#c53030] to-[#9b2c2c] flex items-center justify-center">
                        <Plus className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Yeni Ders Ekle</h1>
                        <p className="text-slate-400">Verdiğiniz dersi sisteme kaydedin</p>
                    </div>
                </div>
            </div>

            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label className="text-slate-300">Ders Kodu</Label>
                            <Input
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                placeholder="Örn: BIL101"
                                className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl uppercase"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label className="text-slate-300">Ders Adı</Label>
                            <Input
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Örn: Bilgisayar Programlama"
                                className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl"
                            />
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-14 bg-[#c53030] hover:bg-[#9b2c2c] text-white rounded-xl text-lg font-semibold gap-2"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Ekleniyor...</>
                            ) : (
                                <><BookOpen className="w-5 h-5" /> Ders Ekle</>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
