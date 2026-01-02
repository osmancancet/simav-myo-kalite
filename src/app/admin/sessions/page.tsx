import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import { Clock, Globe, User, Shield, Activity } from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { isAdminRole, getRoleDisplayName } from "@/lib/roles"

export const dynamic = "force-dynamic"

interface LoginActivity {
    id: string
    userId: string
    action: string
    entityType: string
    entityId: string | null
    details: string | null
    createdAt: Date
    user: {
        id: string
        name: string | null
        email: string
        role: string
    }
}

export default async function SessionsPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) redirect("/hoca")

    const loginActivities = await prisma.activityLog.findMany({
        where: { action: "LOGIN" },
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 100
    }) as LoginActivity[]

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayLogins = loginActivities.filter(l => new Date(l.createdAt) >= todayStart).length
    const uniqueToday = new Set(loginActivities.filter(l => new Date(l.createdAt) >= todayStart).map(l => l.userId)).size

    const userLogins: { [key: string]: LoginActivity[] } = {}
    loginActivities.forEach(activity => {
        if (!userLogins[activity.userId]) {
            userLogins[activity.userId] = []
        }
        userLogins[activity.userId].push(activity)
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500 via-cyan-600 to-blue-600 flex items-center justify-center shadow-xl shadow-cyan-500/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Oturum Geçmişi</h1>
                        <p className="text-slate-400 mt-1">Kullanıcı giriş kayıtları</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/20 to-blue-600/5 border-blue-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/30 flex items-center justify-center">
                                <Clock className="w-6 h-6 text-blue-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{todayLogins}</p>
                                <p className="text-sm text-blue-300">Bugün Giriş</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                <User className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{uniqueToday}</p>
                                <p className="text-sm text-emerald-300">Aktif Kullanıcı</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                                <Globe className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{loginActivities.length}</p>
                                <p className="text-sm text-purple-300">Toplam Kayıt</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                {Object.entries(userLogins).map(([userId, activities]) => {
                    const userData = activities[0].user

                    return (
                        <Card key={userId} className="bg-slate-800/60 border-slate-700/50 backdrop-blur-xl">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                        {userData.name?.charAt(0) || userData.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white">{userData.name || userData.email}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm text-slate-400">{userData.email}</span>
                                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${userData.role === "MUDUR" ? "bg-purple-500/20 text-purple-400" :
                                                    userData.role === "MUDUR_YRD" ? "bg-indigo-500/20 text-indigo-400" :
                                                        "bg-blue-500/20 text-blue-400"
                                                }`}>
                                                {getRoleDisplayName(userData.role)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {activities.slice(0, 6).map((activity) => (
                                        <div
                                            key={activity.id}
                                            className="flex items-center gap-3 p-3 rounded-xl bg-slate-700/30 border border-slate-600/30"
                                        >
                                            <div className="w-10 h-10 rounded-lg bg-slate-600/50 flex items-center justify-center">
                                                <Activity className="w-5 h-5 text-slate-400" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-sm font-medium text-white">Giriş</span>
                                                    {activity.details && (
                                                        <span className="text-xs text-slate-500">{activity.details}</span>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-400">
                                                    {new Date(activity.createdAt).toLocaleString("tr-TR", {
                                                        day: 'numeric',
                                                        month: 'short',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })}

                {Object.keys(userLogins).length === 0 && (
                    <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                        <CardContent className="py-16 text-center">
                            <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                                <Shield className="w-10 h-10 text-slate-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Oturum kaydı yok</h3>
                            <p className="text-slate-400">Henüz kayıtlı giriş bulunmuyor</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    )
}
