"use client"

import { GlobalSearch } from "@/components/GlobalSearch"
import { ThemeSelector } from "@/components/ThemeSelector"

export function HeaderActions() {
    return (
        <div className="flex items-center gap-2">
            <GlobalSearch />
            <ThemeSelector />
        </div>
    )
}
