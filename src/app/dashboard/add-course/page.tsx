"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { BookOpen, Plus, CheckCircle2, XCircle, Loader2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function AddCoursePage() {
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setNotification(null)

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

            setNotification({ type: "success", message: "Ders başarıyla eklendi!" })
            setTimeout(() => {
                router.push("/dashboard")
                router.refresh()
            }, 1500)
        } catch (err: any) {
            setNotification({ type: "error", message: err.message })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-8">
            <div className="max-w-xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/dashboard">
                        <Button variant="ghost" size="icon" className="rounded-full">
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-[#1a365d]">Yeni Ders Ekle</h1>
                        <p className="text-slate-500">Verdiğiniz dersi sisteme ekleyin</p>
                    </div>
                </div>

                {/* Notification */}
                {notification && (
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl mb-6 ${notification.type === "success"
                            ? "bg-emerald-500 text-white"
                            : "bg-red-500 text-white"
                        }`}>
                        {notification.type === "success" ? (
                            <CheckCircle2 className="w-6 h-6" />
                        ) : (
                            <XCircle className="w-6 h-6" />
                        )}
                        <span className="font-medium">{notification.message}</span>
                    </div>
                )}

                {/* Form */}
                <Card className="border-0 shadow-xl">
                    <div className="h-2 bg-[#1a365d]" />
                    <CardContent className="p-8">
                        <div className="w-16 h-16 rounded-2xl bg-[#1a365d] flex items-center justify-center mx-auto mb-6">
                            <BookOpen className="w-8 h-8 text-white" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="code" className="text-slate-700 font-medium">Ders Kodu</Label>
                                <Input
                                    id="code"
                                    type="text"
                                    placeholder="Örn: BIL101"
                                    value={code}
                                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                                    className="h-12 text-lg uppercase"
                                    required
                                    maxLength={10}
                                />
                                <p className="text-xs text-slate-400">Dersin resmi kodu (max 10 karakter)</p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-slate-700 font-medium">Ders Adı</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Örn: Bilgisayar Programlama"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="h-12 text-lg"
                                    required
                                />
                            </div>

                            <Button
                                type="submit"
                                disabled={loading || !code.trim() || !name.trim()}
                                className="w-full h-14 bg-[#c53030] hover:bg-[#9b2c2c] text-white font-semibold text-lg gap-3 rounded-xl shadow-lg"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Ekleniyor...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-6 h-6" />
                                        Dersi Ekle
                                    </>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Info */}
                <p className="text-center text-slate-400 text-sm mt-6">
                    Eklediğiniz dersler otomatik olarak size atanacaktır.
                </p>
            </div>
        </div>
    )
}
