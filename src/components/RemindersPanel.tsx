"use client"

import { useState, useEffect } from "react"
import { AlertTriangle, CheckCircle, Clock, X, ChevronRight } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"

interface Reminder {
    id: string
    type: string
    title: string
    message: string
    priority: "high" | "medium" | "low"
    courseId?: string
    examId?: string
}

export function RemindersPanel() {
    const [reminders, setReminders] = useState<Reminder[]>([])
    const [loading, setLoading] = useState(true)
    const [dismissed, setDismissed] = useState<string[]>([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem("dismissed_reminders") || "[]")
        setDismissed(stored)
        fetchReminders()
    }, [])

    async function fetchReminders() {
        try {
            const res = await fetch("/api/reminders")
            if (res.ok) {
                const data = await res.json()
                setReminders(data)
            }
        } catch (error) {
            console.error("Reminders error:", error)
        } finally {
            setLoading(false)
        }
    }

    const dismissReminder = (id: string) => {
        const newDismissed = [...dismissed, id]
        setDismissed(newDismissed)
        localStorage.setItem("dismissed_reminders", JSON.stringify(newDismissed))
    }

    const activeReminders = reminders.filter(r => !dismissed.includes(r.id))

    if (loading || activeReminders.length === 0) return null

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case "high": return <AlertTriangle className="w-5 h-5 text-red-400" />
            case "medium": return <Clock className="w-5 h-5 text-amber-400" />
            default: return <CheckCircle className="w-5 h-5 text-blue-400" />
        }
    }

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "high": return "border-l-red-500 bg-red-500/5"
            case "medium": return "border-l-amber-500 bg-amber-500/5"
            default: return "border-l-blue-500 bg-blue-500/5"
        }
    }

    return (
        <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                        Hatırlatmalar
                    </h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-400">
                        {activeReminders.length}
                    </span>
                </div>

                <div className="space-y-2">
                    {activeReminders.slice(0, 5).map((reminder) => (
                        <Link
                            key={reminder.id}
                            href={reminder.courseId ? `/hoca/ders/${reminder.courseId}` : "/hoca/derslerim"}
                        >
                            <div className={`flex items-center gap-3 p-3 rounded-xl border-l-4 ${getPriorityColor(reminder.priority)} hover:bg-slate-700/30 transition-colors group`}>
                                {getPriorityIcon(reminder.priority)}
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-white">{reminder.title}</p>
                                    <p className="text-xs text-slate-500 truncate">{reminder.message}</p>
                                </div>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault()
                                        dismissReminder(reminder.id)
                                    }}
                                    className="p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                                <ChevronRight className="w-4 h-4 text-slate-500" />
                            </div>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}
