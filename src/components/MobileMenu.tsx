"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MobileMenuProps {
    children: React.ReactNode
}

export function MobileMenu({ children }: MobileMenuProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setOpen(true)}
                className="md:hidden text-slate-400 hover:text-white"
            >
                <Menu className="w-6 h-6" />
            </Button>

            {open && (
                <div className="fixed inset-0 z-[90] md:hidden">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-72 bg-slate-800 border-r border-slate-700 animate-slide-in">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <span className="font-bold text-white">Menü</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setOpen(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>
                        <div onClick={() => setOpen(false)}>
                            {children}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
