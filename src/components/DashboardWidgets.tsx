"use client"

import { useState, useEffect, useCallback } from "react"
import { GripVertical, X, Plus, BarChart2, Clock, FileText, Users } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

type WidgetType = "stats" | "recent" | "chart" | "reminders"

interface Widget {
    id: string
    type: WidgetType
    title: string
    size: "small" | "medium" | "large"
}

const defaultWidgets: Widget[] = [
    { id: "1", type: "stats", title: "İstatistikler", size: "medium" },
    { id: "2", type: "recent", title: "Son Aktiviteler", size: "medium" },
    { id: "3", type: "chart", title: "Grafik", size: "large" },
]

const widgetIcons: Record<WidgetType, any> = {
    stats: BarChart2,
    recent: Clock,
    chart: FileText,
    reminders: Users
}

interface DashboardWidgetsProps {
    renderWidget: (widget: Widget) => React.ReactNode
}

export function DashboardWidgets({ renderWidget }: DashboardWidgetsProps) {
    const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets)
    const [editMode, setEditMode] = useState(false)
    const [draggedId, setDraggedId] = useState<string | null>(null)

    useEffect(() => {
        const saved = localStorage.getItem("dashboard_widgets")
        if (saved) {
            try {
                setWidgets(JSON.parse(saved))
            } catch (e) {
                console.error("Widget load error:", e)
            }
        }
    }, [])

    const saveWidgets = useCallback((newWidgets: Widget[]) => {
        setWidgets(newWidgets)
        localStorage.setItem("dashboard_widgets", JSON.stringify(newWidgets))
    }, [])

    const removeWidget = (id: string) => {
        saveWidgets(widgets.filter(w => w.id !== id))
    }

    const addWidget = (type: WidgetType) => {
        const titles: Record<WidgetType, string> = {
            stats: "İstatistikler",
            recent: "Son Aktiviteler",
            chart: "Grafik",
            reminders: "Hatırlatmalar"
        }
        const newWidget: Widget = {
            id: Date.now().toString(),
            type,
            title: titles[type],
            size: "medium"
        }
        saveWidgets([...widgets, newWidget])
    }

    const handleDragStart = (id: string) => {
        setDraggedId(id)
    }

    const handleDragOver = (e: React.DragEvent, targetId: string) => {
        e.preventDefault()
        if (!draggedId || draggedId === targetId) return

        const draggedIndex = widgets.findIndex(w => w.id === draggedId)
        const targetIndex = widgets.findIndex(w => w.id === targetId)

        const newWidgets = [...widgets]
        const [removed] = newWidgets.splice(draggedIndex, 1)
        newWidgets.splice(targetIndex, 0, removed)

        saveWidgets(newWidgets)
    }

    const handleDragEnd = () => {
        setDraggedId(null)
    }

    const getSizeClass = (size: string) => {
        switch (size) {
            case "small": return "col-span-1"
            case "large": return "col-span-2"
            default: return "col-span-1"
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-end gap-2">
                {editMode && (
                    <div className="flex items-center gap-2">
                        {(["stats", "recent", "chart", "reminders"] as WidgetType[]).map((type) => {
                            const Icon = widgetIcons[type]
                            return (
                                <Button
                                    key={type}
                                    variant="outline"
                                    size="sm"
                                    onClick={() => addWidget(type)}
                                    className="gap-1 text-xs border-slate-600 text-slate-300"
                                >
                                    <Icon className="w-3 h-3" />
                                    Ekle
                                </Button>
                            )
                        })}
                    </div>
                )}
                <Button
                    variant={editMode ? "default" : "outline"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                    className={editMode ? "bg-blue-600" : "border-slate-600 text-slate-300"}
                >
                    {editMode ? "Kaydet" : "Düzenle"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgets.map((widget) => (
                    <div
                        key={widget.id}
                        className={`${getSizeClass(widget.size)} ${draggedId === widget.id ? "opacity-50" : ""}`}
                        draggable={editMode}
                        onDragStart={() => handleDragStart(widget.id)}
                        onDragOver={(e) => handleDragOver(e, widget.id)}
                        onDragEnd={handleDragEnd}
                    >
                        <Card className="bg-slate-800/50 border-slate-700/50 h-full relative group">
                            {editMode && (
                                <div className="absolute top-2 right-2 flex items-center gap-1 z-10">
                                    <div className="p-1 cursor-move text-slate-500">
                                        <GripVertical className="w-4 h-4" />
                                    </div>
                                    <button
                                        onClick={() => removeWidget(widget.id)}
                                        className="p-1 text-slate-500 hover:text-red-400"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                            <CardContent className="p-5">
                                {renderWidget(widget)}
                            </CardContent>
                        </Card>
                    </div>
                ))}
            </div>
        </div>
    )
}
