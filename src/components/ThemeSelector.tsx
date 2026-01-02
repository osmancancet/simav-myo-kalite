"use client"

import { useState, useRef, useEffect } from "react"
import { Palette, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "./ThemeProvider"

export function ThemeSelector() {
    const { theme, setTheme, availableThemes } = useTheme()
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const themeColors: Record<string, string> = {
        dark: "bg-slate-700",
        light: "bg-gray-300",
        blue: "bg-blue-600",
        purple: "bg-purple-600",
        green: "bg-emerald-600"
    }

    return (
        <div className="relative" ref={ref}>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(!open)}
                className="text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl"
            >
                <Palette className="w-5 h-5" />
            </Button>

            {open && (
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="p-2">
                        <p className="text-xs text-slate-500 uppercase tracking-wider px-3 py-2">Tema Seç</p>
                        {availableThemes.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => {
                                    setTheme(t.key)
                                    setOpen(false)
                                }}
                                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${theme === t.key ? "bg-slate-700 text-white" : "text-slate-400 hover:bg-slate-700/50 hover:text-white"
                                    }`}
                            >
                                <div className={`w-5 h-5 rounded-full ${themeColors[t.key]}`} />
                                <span className="text-sm font-medium">{t.name}</span>
                                {theme === t.key && <Check className="w-4 h-4 ml-auto text-blue-400" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
