import { prisma } from "@/lib/prisma"
import { Card, CardContent } from "@/components/ui/card"
import {
    Activity, User, Upload, Trash2, PlusCircle, Edit,
    LogIn, BookOpen, Calendar, FileText, Clock, Users
} from "lucide-react"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { isAdminRole, getRoleDisplayName } from "@/lib/roles"

export const dynamic = "force-dynamic"

const getActionIcon = (action: string) => {
    switch (action) {
        case "UPLOAD": return Upload
        case "DELETE": return Trash2
        case "CREATE": return PlusCircle
        case "UPDATE": return Edit
        case "LOGIN": return LogIn
        default: return Activity
    }
}

const getActionColor = (action: string) => {
    switch (action) {
        case "UPLOAD": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
        case "DELETE": return "bg-red-500/20 text-red-400 border-red-500/30"
        case "CREATE": return "bg-blue-500/20 text-blue-400 border-blue-500/30"
        case "UPDATE": return "bg-amber-500/20 text-amber-400 border-amber-500/30"
        case "LOGIN": return "bg-purple-500/20 text-purple-400 border-purple-500/30"
        default: return "bg-slate-500/20 text-slate-400 border-slate-500/30"
    }
}

const getActionLabel = (action: string) => {
    switch (action) {
        case "UPLOAD": return "Yükleme"
        case "DELETE": return "Silme"
        case "CREATE": return "Oluşturma"
        case "UPDATE": return "Güncelleme"
        case "LOGIN": return "Giriş"
        default: return action
    }
}

const getEntityLabel = (entityType: string) => {
    switch (entityType) {
        case "COURSE": return "Ders"
        case "EXAM": return "Sınav"
        case "FILE": return "Dosya"
        case "USER": return "Kullanıcı"
        default: return entityType
    }
}

interface ActivityWithUser {
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

export default async function ActivitiesPage() {
    const session = await auth()
    if (!session?.user?.email) redirect("/login")

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) redirect("/hoca")

    const activities = await prisma.activityLog.findMany({
        include: {
            user: {
                select: { id: true, name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 100
    }) as ActivityWithUser[]

    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const todayActivities = activities.filter(a => new Date(a.createdAt) >= todayStart).length
    const uploadCount = activities.filter(a => a.action === "UPLOAD").length
    const uniqueUsers = new Set(activities.map(a => a.userId)).size

    const groupedActivities: { [key: string]: ActivityWithUser[] } = {}
    activities.forEach(activity => {
        const date = new Date(activity.createdAt).toLocaleDateString("tr-TR", {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
        if (!groupedActivities[date]) {
            groupedActivities[date] = []
        }
        groupedActivities[date].push(activity)
    })

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-xl shadow-indigo-500/20">
                        <Activity className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Aktivite Takibi</h1>
                        <p className="text-slate-400 mt-1">Tüm kullanıcı işlemlerini görüntüleyin</p>
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
                                <p className="text-3xl font-bold text-white">{todayActivities}</p>
                                <p className="text-sm text-blue-300">Bugün</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/5 border-emerald-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-500/30 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{uploadCount}</p>
                                <p className="text-sm text-emerald-300">Yükleme</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/20 to-purple-600/5 border-purple-500/30">
                    <CardContent className="p-5">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/30 flex items-center justify-center">
                                <Users className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-3xl font-bold text-white">{uniqueUsers}</p>
                                <p className="text-sm text-purple-300">Aktif Kullanıcı</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {activities.length === 0 ? (
                <Card className="bg-slate-800/30 border-2 border-dashed border-slate-700">
                    <CardContent className="py-16 text-center">
                        <div className="w-20 h-20 rounded-full bg-slate-700/50 flex items-center justify-center mx-auto mb-4">
                            <Activity className="w-10 h-10 text-slate-500" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Henüz aktivite yok</h3>
                        <p className="text-slate-400">Kullanıcı aktiviteleri burada görünecek</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groupedActivities).map(([date, dayActivities]) => (
                        <div key={date}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-slate-700/50 flex items-center justify-center">
                                    <Calendar className="w-5 h-5 text-slate-400" />
                                </div>
                                <h2 className="text-lg font-bold text-white">{date}</h2>
                                <span className="px-2.5 py-1 rounded-full bg-slate-700/50 text-slate-300 text-sm font-medium">
                                    {dayActivities.length}
                                </span>
                            </div>

                            <div className="space-y-3 ml-5 border-l-2 border-slate-700 pl-6">
                                {dayActivities.map((activity) => {
                                    const ActionIcon = getActionIcon(activity.action)

                                    return (
                                        <div
                                            key={activity.id}
                                            className="relative bg-slate-800/60 border border-slate-700/50 rounded-xl p-4 hover:border-slate-600 transition-all"
                                        >
                                            <div className="absolute -left-[31px] top-5 w-4 h-4 rounded-full bg-slate-800 border-2 border-slate-600" />

                                            <div className="flex items-start gap-4">
                                                <div className={`w-12 h-12 rounded-xl ${getActionColor(activity.action)} flex items-center justify-center border flex-shrink-0`}>
                                                    <ActionIcon className="w-6 h-6" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 mb-1">
                                                        <span className="font-semibold text-white">{activity.user.name || activity.user.email}</span>
                                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${activity.user.role === "MUDUR" ? "bg-purple-500/20 text-purple-400" :
                                                            activity.user.role === "MUDUR_YRD" ? "bg-indigo-500/20 text-indigo-400" :
                                                                "bg-blue-500/20 text-blue-400"
                                                            }`}>
                                                            {getRoleDisplayName(activity.user.role)}
                                                        </span>
                                                    </div>
                                                    <p className="text-slate-300">
                                                        <span className={`font-medium ${getActionColor(activity.action).split(' ')[1]}`}>
                                                            {getActionLabel(activity.action)}
                                                        </span>
                                                        {" · "}
                                                        <span className="text-slate-400">
                                                            {getEntityLabel(activity.entityType)}
                                                        </span>
                                                        {activity.details && (
                                                            <span className="text-slate-400"> · {activity.details}</span>
                                                        )}
                                                    </p>
                                                    <p className="text-xs text-slate-500 mt-1">
                                                        {new Date(activity.createdAt).toLocaleTimeString("tr-TR", { hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
