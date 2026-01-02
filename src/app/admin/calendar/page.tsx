"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Plus, ChevronLeft, ChevronRight, Clock, BookOpen, Trash2, X, Loader2 } from "lucide-react"

interface AcademicEvent {
    id: string
    title: string
    description?: string
    type: string
    startDate: string
    endDate?: string
    allDay: boolean
    course?: { code: string; name: string }
    createdBy?: { name: string }
}

const eventTypeColors: Record<string, string> = {
    EXAM_DATE: "bg-red-500",
    DEADLINE: "bg-amber-500",
    HOLIDAY: "bg-emerald-500",
    MEETING: "bg-blue-500"
}

const eventTypeLabels: Record<string, string> = {
    EXAM_DATE: "Sınav",
    DEADLINE: "Son Tarih",
    HOLIDAY: "Tatil",
    MEETING: "Toplantı"
}

export default function AdminCalendarPage() {
    const [events, setEvents] = useState<AcademicEvent[]>([])
    const [loading, setLoading] = useState(true)
    const [currentDate, setCurrentDate] = useState(new Date())
    const [showModal, setShowModal] = useState(false)
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        type: "EXAM_DATE",
        startDate: "",
        endDate: "",
        allDay: true
    })
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchEvents()
    }, [currentDate])

    async function fetchEvents() {
        setLoading(true)
        try {
            const year = currentDate.getFullYear()
            const month = currentDate.getMonth()
            const start = new Date(year, month, 1).toISOString()
            const end = new Date(year, month + 1, 0).toISOString()

            const res = await fetch(`/api/calendar?start=${start}&end=${end}`)
            if (res.ok) {
                const data = await res.json()
                setEvents(data)
            }
        } catch (error) {
            console.error("Error fetching events:", error)
        } finally {
            setLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)
        try {
            const res = await fetch("/api/calendar", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData)
            })
            if (res.ok) {
                setShowModal(false)
                setFormData({ title: "", description: "", type: "EXAM_DATE", startDate: "", endDate: "", allDay: true })
                fetchEvents()
            }
        } catch (error) {
            console.error("Error creating event:", error)
        } finally {
            setSaving(false)
        }
    }

    async function handleDelete(eventId: string) {
        if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) return
        try {
            const res = await fetch(`/api/calendar?id=${eventId}`, { method: "DELETE" })
            if (res.ok) fetchEvents()
        } catch (error) {
            console.error("Error deleting event:", error)
        }
    }

    // Calendar helpers
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"]
    const dayNames = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"]

    const days = []
    const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1
    for (let i = 0; i < adjustedFirstDay; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }

    function getEventsForDay(day: number) {
        return events.filter(e => {
            const eventDate = new Date(e.startDate)
            return eventDate.getDate() === day && eventDate.getMonth() === month && eventDate.getFullYear() === year
        })
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Akademik Takvim</h1>
                        <p className="text-slate-400">Sınav ve etkinlik tarihlerini yönetin</p>
                    </div>
                </div>
                <Button onClick={() => setShowModal(true)} className="bg-[#c53030] hover:bg-[#9b2c2c] gap-2">
                    <Plus className="w-4 h-4" /> Etkinlik Ekle
                </Button>
            </div>

            {/* Calendar Navigation */}
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentDate(new Date(year, month - 1))}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                        <h2 className="text-xl font-bold text-white">
                            {monthNames[month]} {year}
                        </h2>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setCurrentDate(new Date(year, month + 1))}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </Button>
                    </div>

                    {/* Day headers */}
                    <div className="grid grid-cols-7 gap-2 mb-2">
                        {dayNames.map(day => (
                            <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-7 gap-2">
                            {days.map((day, i) => {
                                const dayEvents = day ? getEventsForDay(day) : []
                                const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear()

                                return (
                                    <div
                                        key={i}
                                        className={`min-h-24 p-2 rounded-lg border transition-colors ${day
                                                ? isToday
                                                    ? "border-blue-500 bg-blue-500/10"
                                                    : "border-slate-700 hover:border-slate-600"
                                                : "border-transparent"
                                            }`}
                                    >
                                        {day && (
                                            <>
                                                <p className={`text-sm font-medium mb-1 ${isToday ? "text-blue-400" : "text-slate-300"}`}>
                                                    {day}
                                                </p>
                                                <div className="space-y-1">
                                                    {dayEvents.slice(0, 2).map(event => (
                                                        <div
                                                            key={event.id}
                                                            className={`text-xs p-1 rounded truncate text-white ${eventTypeColors[event.type] || "bg-slate-600"}`}
                                                            title={event.title}
                                                        >
                                                            {event.title}
                                                        </div>
                                                    ))}
                                                    {dayEvents.length > 2 && (
                                                        <p className="text-xs text-slate-500">+{dayEvents.length - 2} daha</p>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Upcoming Events */}
            <Card className="bg-slate-800/50 border-slate-700/50">
                <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Clock className="w-5 h-5 text-amber-400" /> Yaklaşan Etkinlikler
                    </h3>
                    <div className="space-y-3">
                        {events.length === 0 ? (
                            <p className="text-slate-400 text-center py-4">Bu ay etkinlik bulunmuyor</p>
                        ) : (
                            events.slice(0, 5).map(event => (
                                <div key={event.id} className="flex items-center gap-4 p-3 rounded-lg bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                                    <div className={`w-3 h-3 rounded-full ${eventTypeColors[event.type]}`} />
                                    <div className="flex-1">
                                        <p className="font-medium text-white">{event.title}</p>
                                        <p className="text-sm text-slate-400">
                                            {new Date(event.startDate).toLocaleDateString("tr-TR", {
                                                day: "numeric",
                                                month: "long",
                                                year: "numeric"
                                            })}
                                            {event.course && ` • ${event.course.code}`}
                                        </p>
                                    </div>
                                    <span className={`px-2 py-1 rounded text-xs text-white ${eventTypeColors[event.type]}`}>
                                        {eventTypeLabels[event.type]}
                                    </span>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-300">
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <Card className="w-full max-w-md bg-slate-800 border-slate-700">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white">Yeni Etkinlik</h3>
                                <Button variant="ghost" size="icon" onClick={() => setShowModal(false)}>
                                    <X className="w-5 h-5" />
                                </Button>
                            </div>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Başlık</label>
                                    <input
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tür</label>
                                    <select
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                    >
                                        <option value="EXAM_DATE">Sınav</option>
                                        <option value="DEADLINE">Son Tarih</option>
                                        <option value="HOLIDAY">Tatil</option>
                                        <option value="MEETING">Toplantı</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Tarih</label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-300 mb-1">Açıklama (opsiyonel)</label>
                                    <textarea
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full px-3 py-2 rounded-lg bg-slate-700 border border-slate-600 text-white"
                                        rows={3}
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
