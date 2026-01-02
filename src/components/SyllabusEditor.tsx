"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    BookOpen, Save, Loader2, FileText, Target, Clock,
    Users, Calendar, CheckCircle, Plus, Trash2
} from "lucide-react"

interface SyllabusProps {
    courseId: string
    courseName: string
    courseCode: string
}

interface SyllabusData {
    id?: string
    objectives: string
    weeklyPlan: string
    assessmentCriteria: string
    resources: string
}

export function SyllabusEditor({ courseId, courseName, courseCode }: SyllabusProps) {
    const [syllabus, setSyllabus] = useState<SyllabusData>({
        objectives: "",
        weeklyPlan: "",
        assessmentCriteria: "",
        resources: ""
    })
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

    useEffect(() => {
        fetchSyllabus()
    }, [courseId])

    async function fetchSyllabus() {
        try {
            const res = await fetch(`/api/syllabus?courseId=${courseId}`)
            if (res.ok) {
                const data = await res.json()
                if (data) {
                    setSyllabus(data)
                }
            }
        } catch (error) {
            console.error("Error fetching syllabus:", error)
        } finally {
            setLoading(false)
        }
    }

    async function saveSyllabus() {
        setSaving(true)
        setMessage(null)

        try {
            const res = await fetch("/api/syllabus", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    courseId,
                    ...syllabus
                })
            })

            if (!res.ok) throw new Error("Kayıt başarısız")

            const data = await res.json()
            setSyllabus(data)
            setMessage({ type: "success", text: "İzlence başarıyla kaydedildi!" })
        } catch (error) {
            setMessage({ type: "error", text: "İzlence kaydedilemedi!" })
        } finally {
            setSaving(false)
            setTimeout(() => setMessage(null), 3000)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
        )
    }

    return (
        <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-xl">
            <CardContent className="p-6 space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Ders İzlencesi</h2>
                            <p className="text-slate-400">{courseCode} - {courseName}</p>
                        </div>
                    </div>
                    <Button
                        onClick={saveSyllabus}
                        disabled={saving}
                        className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Kaydet
                    </Button>
                </div>

                {message && (
                    <div className={`p-4 rounded-xl ${message.type === "success" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                        {message.text}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Objectives */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Target className="w-5 h-5 text-blue-400" />
                            <Label className="text-slate-300 font-medium">Öğrenme Çıktıları</Label>
                        </div>
                        <textarea
                            value={syllabus.objectives}
                            onChange={(e) => setSyllabus({ ...syllabus, objectives: e.target.value })}
                            className="w-full h-40 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none"
                            placeholder="Dersin sonunda öğrenci...
• Temel kavramları açıklayabilecektir
• Pratik uygulamalar yapabilecektir
• Analiz ve değerlendirme yapabilecektir"
                        />
                    </div>

                    {/* Weekly Plan */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-amber-400" />
                            <Label className="text-slate-300 font-medium">Haftalık Plan</Label>
                        </div>
                        <textarea
                            value={syllabus.weeklyPlan}
                            onChange={(e) => setSyllabus({ ...syllabus, weeklyPlan: e.target.value })}
                            className="w-full h-40 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none"
                            placeholder="1. Hafta: Giriş ve temel kavramlar
2. Hafta: Teori ve uygulama
3. Hafta: Pratik çalışmalar
..."
                        />
                    </div>

                    {/* Assessment */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-emerald-400" />
                            <Label className="text-slate-300 font-medium">Değerlendirme Kriterleri</Label>
                        </div>
                        <textarea
                            value={syllabus.assessmentCriteria}
                            onChange={(e) => setSyllabus({ ...syllabus, assessmentCriteria: e.target.value })}
                            className="w-full h-40 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none"
                            placeholder="• Vize Sınavı: %40
• Final Sınavı: %50
• Ödev/Proje: %10"
                        />
                    </div>

                    {/* Resources */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-purple-400" />
                            <Label className="text-slate-300 font-medium">Kaynaklar</Label>
                        </div>
                        <textarea
                            value={syllabus.resources}
                            onChange={(e) => setSyllabus({ ...syllabus, resources: e.target.value })}
                            className="w-full h-40 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder:text-slate-500 resize-none"
                            placeholder="Ders Kitabı:
• Yazar, Kitap Adı, Yıl

Online Kaynaklar:
• www.example.com"
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
