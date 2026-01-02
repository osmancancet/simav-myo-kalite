"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, X, Check, Clock, AlertTriangle, Info, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Notification {
    id: string
    title: string
    message: string
    type: string
    read: boolean
    createdAt: string
    link?: string
}

export function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(true)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchNotifications()

        // Refresh every 30 seconds
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    async function fetchNotifications() {
        try {
            const res = await fetch("/api/notifications")
            if (res.ok) {
                const data = await res.json()
                setNotifications(data)
            }
        } catch (error) {
            console.error("Error fetching notifications:", error)
        } finally {
            setLoading(false)
        }
    }

    async function markAsRead(id: string) {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id })
            })
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
        } catch (error) {
            console.error("Error marking as read:", error)
        }
    }

    async function markAllAsRead() {
        try {
            await fetch("/api/notifications", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markAll: true })
            })
            setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        } catch (error) {
            console.error("Error marking all as read:", error)
        }
    }

    const unreadCount = notifications.filter(n => !n.read).length

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "SUCCESS": return <CheckCircle className="w-5 h-5 text-emerald-400" />
            case "WARNING": return <AlertTriangle className="w-5 h-5 text-amber-400" />
            case "ERROR": return <X className="w-5 h-5 text-red-400" />
            default: return <Info className="w-5 h-5 text-blue-400" />
        }
    }

    const getTypeColor = (type: string) => {
        switch (type) {
            case "SUCCESS": return "border-l-emerald-500"
            case "WARNING": return "border-l-amber-500"
            case "ERROR": return "border-l-red-500"
            default: return "border-l-blue-500"
        }
    }

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="ghost"
                size="icon"
                className="relative text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl"
                onClick={() => setOpen(!open)}
            >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {open && (
                <div className="absolute right-0 mt-2 w-96 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-slate-700">
                        <h3 className="font-bold text-white">Bildirimler</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                className="text-xs text-blue-400 hover:text-blue-300"
                            >
                                Tümünü okundu işaretle
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {loading ? (
                            <div className="p-8 text-center">
                                <Clock className="w-8 h-8 text-slate-500 mx-auto animate-spin" />
                            </div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center">
                                <Bell className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                                <p className="text-slate-400">Bildirim yok</p>
                            </div>
                        ) : (
                            notifications.slice(0, 10).map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`p-4 border-b border-slate-700/50 border-l-4 ${getTypeColor(notification.type)} ${!notification.read ? "bg-slate-700/30" : ""
                                        } hover:bg-slate-700/50 transition-colors cursor-pointer`}
                                    onClick={() => {
                                        if (!notification.read) markAsRead(notification.id)
                                        if (notification.link) window.location.href = notification.link
                                    }}
                                >
                                    <div className="flex gap-3">
                                        <div className="flex-shrink-0 mt-0.5">
                                            {getTypeIcon(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-white text-sm truncate">
                                                    {notification.title}
                                                </p>
                                                {!notification.read && (
                                                    <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-sm text-slate-400 line-clamp-2">
                                                {notification.message}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-1">
                                                {new Date(notification.createdAt).toLocaleDateString("tr-TR", {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="p-3 border-t border-slate-700 text-center">
                            <button className="text-sm text-blue-400 hover:text-blue-300">
                                Tüm bildirimleri gör
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
