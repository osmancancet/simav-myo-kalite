import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Users, LogOut, Bell, LayoutDashboard, BookOpen, Calendar, BarChart2, Award, Activity, Shield, Archive, FolderOpen, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { isAdminRole, getRoleDisplayName } from "@/lib/roles"
import { HeaderActions } from "@/components/HeaderActions"
import { MobileMenu } from "@/components/MobileMenu"
import { handleSignOut } from "@/lib/actions"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const session = await auth()

    if (!session?.user?.email) {
        redirect("/login")
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) {
        redirect("/hoca")
    }

    const [userCount, courseCount, pendingRequests] = await Promise.all([
        prisma.user.count(),
        prisma.course.count(),
        prisma.deleteRequest.count({ where: { status: "PENDING" } }),
    ])

    const navSections = [
        {
            title: "Ana Menü",
            items: [
                { href: "/admin", icon: LayoutDashboard, label: "Kontrol Paneli" },
                { href: "/admin/derslerim", icon: BookOpen, label: "Derslerim" },
            ]
        },
        {
            title: "Yönetim",
            items: [
                { href: "/admin/donemler", icon: GraduationCap, label: "Dönem Yönetimi" },
                { href: "/admin/users", icon: Users, label: "Kullanıcılar" },
                { href: "/admin/requests", icon: Bell, label: "Silme Talepleri", badge: pendingRequests },
                { href: "/admin/calendar", icon: Calendar, label: "Akademik Takvim" },
            ]
        },
        {
            title: "İzleme",
            items: [
                { href: "/admin/activities", icon: Activity, label: "Aktiviteler" },
                { href: "/admin/sessions", icon: Shield, label: "Oturumlar" },
                { href: "/admin/reports", icon: BarChart2, label: "Raporlar" },
                { href: "/admin/hoca-raporlari", icon: Users, label: "Hoca Raporları" },
            ]
        },
        {
            title: "Araçlar",
            items: [
                { href: "/admin/archive", icon: Archive, label: "Arşiv" },
                { href: "/admin/plo", icon: Award, label: "Program Çıktıları" },
            ]
        }
    ]

    return (
        <div className="min-h-screen bg-slate-900">
            <header className="fixed top-0 left-0 right-0 h-16 bg-slate-800/95 backdrop-blur-xl border-b border-slate-700/50 z-50">
                <div className="h-full px-6 flex items-center justify-between">
                    <Link href="/admin" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#c53030] to-[#9b2c2c] flex items-center justify-center shadow-lg group-hover:shadow-red-500/20 transition-shadow">
                            <span className="text-white font-bold text-sm">DPÜ</span>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Yönetim Paneli</h1>
                            <p className="text-xs text-slate-400">Simav MYO Kalite Sistemi</p>
                        </div>
                    </Link>

                    <div className="flex items-center gap-4">
                        <div className="hidden lg:flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 border border-blue-500/20">
                                <Users className="w-4 h-4 text-blue-400" />
                                <span className="text-sm font-bold text-blue-400">{userCount}</span>
                            </div>
                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <FolderOpen className="w-4 h-4 text-emerald-400" />
                                <span className="text-sm font-bold text-emerald-400">{courseCount}</span>
                            </div>
                            {pendingRequests > 0 && (
                                <Link
                                    href="/admin/requests"
                                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-colors"
                                >
                                    <Bell className="w-4 h-4 text-red-400" />
                                    <span className="text-sm font-bold text-red-400">{pendingRequests}</span>
                                </Link>
                            )}
                        </div>

                        <HeaderActions />

                        <div className="h-8 w-px bg-slate-700" />

                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-white">{session?.user?.name}</p>
                                <p className="text-xs text-slate-400">{getRoleDisplayName(user.role)}</p>
                            </div>
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-lg">
                                {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <div className="flex pt-16">
                {/* Mobile Menu */}
                <div className="lg:hidden fixed top-16 left-0 right-0 bg-slate-800/95 border-b border-slate-700/50 px-4 py-2 z-40">
                    <MobileMenu>
                        <nav className="p-3 space-y-6 overflow-y-auto max-h-[70vh]">
                            {navSections.map((section) => (
                                <div key={section.title}>
                                    <p className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        {section.title}
                                    </p>
                                    <div className="space-y-1">
                                        {section.items.map((item) => (
                                            <Link
                                                key={item.href}
                                                href={item.href}
                                                className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all"
                                            >
                                                <item.icon className="w-5 h-5" />
                                                <span className="font-medium text-sm">{item.label}</span>
                                                {item.badge && item.badge > 0 && (
                                                    <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <div className="p-3 border-t border-slate-700/50">
                            <form action={handleSignOut}>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl h-11"
                                >
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Çıkış Yap
                                </Button>
                            </form>
                        </div>
                    </MobileMenu>
                </div>

                {/* Desktop Sidebar */}
                <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-64 bg-slate-800/50 backdrop-blur-xl border-r border-slate-700/50 flex-col">
                    <nav className="flex-1 p-3 space-y-6 overflow-y-auto">
                        {navSections.map((section) => (
                            <div key={section.title}>
                                <p className="px-4 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    {section.title}
                                </p>
                                <div className="space-y-1">
                                    {section.items.map((item) => (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-400 hover:bg-slate-700/50 hover:text-white transition-all group"
                                        >
                                            <item.icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-medium text-sm">{item.label}</span>
                                            {item.badge && item.badge > 0 && (
                                                <span className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </nav>

                    <div className="p-3 border-t border-slate-700/50">
                        <form action={handleSignOut}
                        >
                            <Button
                                variant="ghost"
                                className="w-full justify-start text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl h-11"
                            >
                                <LogOut className="w-4 h-4 mr-3" />
                                Çıkış Yap
                            </Button>
                        </form>
                    </div>
                </aside>

                <main className="flex-1 lg:ml-64 min-h-[calc(100vh-4rem)] mt-12 lg:mt-0">
                    <div className="p-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    )
}
