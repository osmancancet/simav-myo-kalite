"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Search, BookOpen, Calendar, FileText, User, X, Command } from "lucide-react"
import { useRouter } from "next/navigation"

interface SearchResult {
    id: string
    type: "course" | "exam" | "file" | "user"
    title: string
    subtitle: string
    href: string
}

export function GlobalSearch() {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const [results, setResults] = useState<SearchResult[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const inputRef = useRef<HTMLInputElement>(null)
    const router = useRouter()

    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setOpen(true)
            }
            if (e.key === "Escape") {
                setOpen(false)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus()
        }
    }, [open])

    useEffect(() => {
        setSelectedIndex(0)
    }, [results])

    const search = useCallback(async (q: string) => {
        if (q.length < 2) {
            setResults([])
            return
        }
        setLoading(true)
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
            if (res.ok) {
                const data = await res.json()
                setResults(data)
            }
        } catch (error) {
            console.error("Search error:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => search(query), 300)
        return () => clearTimeout(timer)
    }, [query, search])

    const handleSelect = (result: SearchResult) => {
        router.push(result.href)
        setOpen(false)
        setQuery("")
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "ArrowDown") {
            e.preventDefault()
            setSelectedIndex(i => Math.min(i + 1, results.length - 1))
        } else if (e.key === "ArrowUp") {
            e.preventDefault()
            setSelectedIndex(i => Math.max(i - 1, 0))
        } else if (e.key === "Enter" && results[selectedIndex]) {
            handleSelect(results[selectedIndex])
        }
    }

    const getIcon = (type: string) => {
        switch (type) {
            case "course": return BookOpen
            case "exam": return Calendar
            case "file": return FileText
            case "user": return User
            default: return Search
        }
    }

    const getTypeLabel = (type: string) => {
        switch (type) {
            case "course": return "Ders"
            case "exam": return "Sınav"
            case "file": return "Dosya"
            case "user": return "Kullanıcı"
            default: return type
        }
    }

    if (!open) {
        return (
            <button
                onClick={() => setOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-slate-400 hover:bg-slate-700 hover:text-white transition-all"
            >
                <Search className="w-4 h-4" />
                <span className="text-sm hidden md:inline">Ara...</span>
                <kbd className="hidden md:flex items-center gap-0.5 px-2 py-0.5 rounded bg-slate-600/50 text-xs">
                    <Command className="w-3 h-3" />K
                </kbd>
            </button>
        )
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setOpen(false)} />

            <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden mx-4">
                <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700">
                    <Search className="w-5 h-5 text-slate-400" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ders, sınav veya dosya ara..."
                        className="flex-1 bg-transparent text-white placeholder:text-slate-500 outline-none text-lg"
                    />
                    <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-700">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="max-h-96 overflow-y-auto">
                    {loading ? (
                        <div className="p-8 text-center">
                            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                        </div>
                    ) : results.length === 0 ? (
                        <div className="p-8 text-center text-slate-500">
                            {query.length < 2 ? "Aramak için en az 2 karakter girin" : "Sonuç bulunamadı"}
                        </div>
                    ) : (
                        <div className="p-2">
                            {results.map((result, index) => {
                                const Icon = getIcon(result.type)
                                return (
                                    <button
                                        key={result.id}
                                        onClick={() => handleSelect(result)}
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${index === selectedIndex ? "bg-blue-500/20 text-white" : "text-slate-300 hover:bg-slate-700/50"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${result.type === "course" ? "bg-blue-500/20 text-blue-400" :
                                                result.type === "exam" ? "bg-amber-500/20 text-amber-400" :
                                                    result.type === "file" ? "bg-emerald-500/20 text-emerald-400" :
                                                        "bg-purple-500/20 text-purple-400"
                                            }`}>
                                            <Icon className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 text-left">
                                            <p className="font-medium">{result.title}</p>
                                            <p className="text-sm text-slate-500">{result.subtitle}</p>
                                        </div>
                                        <span className="text-xs px-2 py-1 rounded-full bg-slate-700 text-slate-400">
                                            {getTypeLabel(result.type)}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 text-xs text-slate-500">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-700">↑↓</kbd> gezin
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-700">Enter</kbd> seç
                        </span>
                        <span className="flex items-center gap-1">
                            <kbd className="px-1.5 py-0.5 rounded bg-slate-700">Esc</kbd> kapat
                        </span>
                    </div>
                </div>
            </div>
        </div>
    )
}
