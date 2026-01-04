"use client"

import { createContext, useContext, useEffect, useState } from "react"

type Theme = "dark" | "light" | "blue" | "purple" | "green"

interface ThemeConfig {
    name: string
    bg: string
    sidebar: string
    card: string
    border: string
    primary: string
}

const themes: Record<Theme, ThemeConfig> = {
    dark: {
        name: "Koyu",
        bg: "bg-slate-900",
        sidebar: "bg-slate-800/50",
        card: "bg-slate-800/50",
        border: "border-slate-700",
        primary: "blue"
    },
    light: {
        name: "Açık",
        bg: "bg-gray-100",
        sidebar: "bg-white",
        card: "bg-white",
        border: "border-gray-200",
        primary: "blue"
    },
    blue: {
        name: "Okyanus",
        bg: "bg-slate-900",
        sidebar: "bg-blue-950/50",
        card: "bg-blue-900/30",
        border: "border-blue-800",
        primary: "cyan"
    },
    purple: {
        name: "Mor",
        bg: "bg-slate-900",
        sidebar: "bg-purple-950/50",
        card: "bg-purple-900/30",
        border: "border-purple-800",
        primary: "purple"
    },
    green: {
        name: "Orman",
        bg: "bg-slate-900",
        sidebar: "bg-emerald-950/50",
        card: "bg-emerald-900/30",
        border: "border-emerald-800",
        primary: "emerald"
    }
}

interface ThemeContextType {
    theme: Theme
    config: ThemeConfig
    setTheme: (theme: Theme) => void
    toggleTheme: () => void
    availableThemes: { key: Theme; name: string }[]
}

const defaultContext: ThemeContextType = {
    theme: "dark",
    config: themes.dark,
    setTheme: () => { },
    toggleTheme: () => { },
    availableThemes: Object.entries(themes).map(([key, value]) => ({
        key: key as Theme,
        name: value.name
    }))
}

const ThemeContext = createContext<ThemeContextType>(defaultContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("dark")
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
        const saved = localStorage.getItem("app-theme") as Theme
        if (saved && themes[saved]) {
            setThemeState(saved)
        }
    }, [])

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme)
        localStorage.setItem("app-theme", newTheme)
    }

    const availableThemes = Object.entries(themes).map(([key, value]) => ({
        key: key as Theme,
        name: value.name
    }))

    const toggleTheme = () => {
        const newTheme = theme === "dark" ? "light" : "dark"
        setTheme(newTheme)
    }

    const value = {
        theme: mounted ? theme : "dark",
        config: themes[mounted ? theme : "dark"],
        setTheme,
        toggleTheme,
        availableThemes
    }

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    )
}

export function useTheme() {
    return useContext(ThemeContext)
}
