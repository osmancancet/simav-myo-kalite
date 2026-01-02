import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Home, BookOpen, Plus, LogOut, Settings, Shield } from "lucide-react"
import { signOut } from "@/auth"
import { Button } from "@/components/ui/button"
import { isAdminRole, getRoleDisplayName } from "@/lib/roles"

export const dynamic = "force-dynamic"

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        include: {
            courses: {
                include: { exams: { include: { files: true } } }
            }
        }
    })

    if (!user) redirect("/login")

    const showAdminLink = isAdminRole(user.role)
    const courseCount = user.courses.length
    const examCount = user.courses.reduce((acc, c) => acc + c.exams.length, 0)

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100">
            {/* Top Header */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 z-50">
                <div className="h-full px-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a365d] to-[#2d4a7c] flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-sm">DPÜ</span>
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-[#1a365d]">Simav MYO</h1>
                                <p className="text-xs text-slate-500">Kalite Yönetim Sistemi</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Stats Pills */}
                        <div className="hidden md:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a365d]/10">
                                <BookOpen className="w-4 h-4 text-[#1a365d]" />
                                <span className="text-sm font-semibold text-[#1a365d]">{courseCount} Ders</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100">
                                <span className="text-sm font-semibold text-emerald-700">{examCount} Sınav</span>
                            </div>
                        </div>

                        {/* User */}
                        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                                <p className="text-xs text-slate-500">{getRoleDisplayName(user.role)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#c53030] to-[#9b2c2c] flex items-center justify-center text-white font-bold shadow-lg">
                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Sidebar */}
                <aside className="fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-slate-200/50 flex flex-col">
                    <nav className="flex-1 p-4 space-y-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#1a365d] bg-[#1a365d]/5 hover:bg-[#1a365d]/10 transition-all font-medium">
                            <Home className="w-5 h-5" />
                            <span>Ana Sayfa</span>
                        </Link>

                        <Link href="/dashboard/my-courses" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                            <BookOpen className="w-5 h-5" />
                            <span>Derslerim</span>
                            {courseCount > 0 && (
                                <span className="ml-auto text-xs font-bold text-white bg-[#1a365d] px-2 py-0.5 rounded-full">{courseCount}</span>
                            )}
                        </Link>

                        <Link href="/dashboard/add-course" className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-slate-100 transition-all">
                            <Plus className="w-5 h-5" />
                            <span>Ders Ekle</span>
                        </Link>

                        {showAdminLink && (
                            <>
                                <div className="pt-4 mt-4 border-t border-slate-200">
                                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Yönetim</p>
                                </div>
                                <Link href="/admin" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#c53030] bg-[#c53030]/5 hover:bg-[#c53030]/10 transition-all font-medium">
                                    <Shield className="w-5 h-5" />
                                    <span>Admin Panel</span>
                                </Link>
                            </>
                        )}
                    </nav>

                    {/* Logout */}
                    <div className="p-4 border-t border-slate-200">
                        <form
                            action={async () => {
                                "use server"
                                await signOut({ redirectTo: "/login" })
                            }}
                        >
                            <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-[#c53030] hover:bg-red-50 rounded-xl">
                                <LogOut className="w-4 h-4 mr-3" />
                                Çıkış Yap
                            </Button>
                        </form>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 ml-64 min-h-[calc(100vh-4rem)]">
                    {children}
                </main>
            </div>
        </div>
    )
}
