"use client"

import { useState, useEffect } from "react"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FavoriteButtonProps {
    itemId: string
    itemType: "course" | "exam"
    className?: string
}

export function FavoriteButton({ itemId, itemType, className }: FavoriteButtonProps) {
    const [isFavorite, setIsFavorite] = useState(false)

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem(`favorites_${itemType}`) || "[]")
        setIsFavorite(favorites.includes(itemId))
    }, [itemId, itemType])

    const toggleFavorite = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        const favorites = JSON.parse(localStorage.getItem(`favorites_${itemType}`) || "[]")
        const newFavorites = isFavorite
            ? favorites.filter((id: string) => id !== itemId)
            : [...favorites, itemId]

        localStorage.setItem(`favorites_${itemType}`, JSON.stringify(newFavorites))
        setIsFavorite(!isFavorite)
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleFavorite}
            className={`${className} ${isFavorite ? "text-amber-400" : "text-slate-500 hover:text-amber-400"}`}
        >
            <Star className={`w-5 h-5 ${isFavorite ? "fill-current" : ""}`} />
        </Button>
    )
}

export function useFavorites(itemType: "course" | "exam") {
    const [favorites, setFavorites] = useState<string[]>([])

    useEffect(() => {
        const stored = JSON.parse(localStorage.getItem(`favorites_${itemType}`) || "[]")
        setFavorites(stored)

        const handleStorage = () => {
            const updated = JSON.parse(localStorage.getItem(`favorites_${itemType}`) || "[]")
            setFavorites(updated)
        }

        window.addEventListener("storage", handleStorage)
        return () => window.removeEventListener("storage", handleStorage)
    }, [itemType])

    return favorites
}
