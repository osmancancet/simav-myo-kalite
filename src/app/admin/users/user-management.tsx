"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useState } from "react"
import {
    UserPlus, Trash2, Crown, GraduationCap, Mail, Search,
    CheckCircle2, XCircle, AlertTriangle, Star, Users,
    BookOpen, MoreVertical, Shield
} from "lucide-react"

interface User {
    id: string
    email: string
    name: string | null
    role: string
    courses: { id: string; code: string; name: string }[]
}

interface UserManagementProps {
    users: User[]
    currentUserRole: string
}

// Role display helpers
const getRoleDisplayName = (role: string) => {
    switch (role) {
        case "MUDUR": return "Müdür"
        case "MUDUR_YRD": return "Müdür Yardımcısı"
        case "HOCA": return "Öğretim Görevlisi"
        default: return role
    }
}

const getRoleConfig = (role: string) => {
    switch (role) {
        case "MUDUR":
            return {
                bg: "bg-gradient-to-br from-purple-500 to-purple-600",
                badge: "bg-purple-500/20 text-purple-300 border-purple-500/30",
                icon: Crown,
                accent: "from-purple-500/20"
            }
        case "MUDUR_YRD":
            return {
                bg: "bg-gradient-to-br from-indigo-500 to-indigo-600",
                badge: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                icon: Star,
                accent: "from-indigo-500/20"
            }
        case "HOCA":
            return {
                bg: "bg-gradient-to-br from-blue-500 to-blue-600",
                badge: "bg-blue-500/20 text-blue-300 border-blue-500/30",
                icon: GraduationCap,
                accent: "from-blue-500/20"
            }
        default:
            return {
                bg: "bg-gradient-to-br from-slate-500 to-slate-600",
                badge: "bg-slate-500/20 text-slate-300 border-slate-500/30",
                icon: Users,
                accent: "from-slate-500/20"
            }
    }
}

// Toast Notification
function Toast({ type, message, onClose }: { type: "success" | "error" | "warning"; message: string; onClose: () => void }) {
    const configs = {
        success: { bg: "bg-emerald-500/20 border-emerald-500/30", icon: CheckCircle2, iconColor: "text-emerald-400" },
        error: { bg: "bg-red-500/20 border-red-500/30", icon: XCircle, iconColor: "text-red-400" },
        warning: { bg: "bg-amber-500/20 border-amber-500/30", icon: AlertTriangle, iconColor: "text-amber-400" }
    }
    const config = configs[type]
    const Icon = config.icon

    return (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-5 py-4 rounded-xl border ${config.bg} backdrop-blur-xl shadow-2xl animate-in slide-in-from-top-2 duration-300`}>
            <Icon className={`w-5 h-5 ${config.iconColor}`} />
            <span className="text-white font-medium">{message}</span>
            <button onClick={onClose} className="ml-2 text-slate-400 hover:text-white transition-colors">
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    )
}

export function UserManagement({ users: initialUsers, currentUserRole }: UserManagementProps) {
    const [users, setUsers] = useState(initialUsers)
    const isAdmin = currentUserRole === "MUDUR" || currentUserRole === "MUDUR_YRD"
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [role, setRole] = useState("HOCA")
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [userToDelete, setUserToDelete] = useState<User | null>(null)
    const [selectedRole, setSelectedRole] = useState<string | null>(null)

    const showNotification = (type: "success" | "error" | "warning", message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 4000)
    }

    const filteredUsers = users.filter(user => {
        const matchesSearch = user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.name?.toLowerCase().includes(searchTerm.toLowerCase())
        const matchesRole = !selectedRole || user.role === selectedRole
        return matchesSearch && matchesRole
    })

    // Stats
    const mudurCount = users.filter(u => u.role === "MUDUR").length
    const mudurYrdCount = users.filter(u => u.role === "MUDUR_YRD").length
    const hocaCount = users.filter(u => u.role === "HOCA").length

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        if (!email.endsWith("@dpu.edu.tr")) {
            showNotification("error", "Sadece @dpu.edu.tr uzantılı e-postalar eklenebilir.")
            setLoading(false)
            return
        }

        try {
            const res = await fetch("/api/admin/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, name, role })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Kullanıcı eklenemedi")
            }

            const newUser = await res.json()
            setUsers([...users, { ...newUser, courses: [] }])
            setEmail("")
            setName("")
            setRole("HOCA")
            setAddDialogOpen(false)
            showNotification("success", `${name || email} başarıyla eklendi!`)
        } catch (err: any) {
            showNotification("error", err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async () => {
        if (!userToDelete) return

        try {
            const res = await fetch(`/api/admin/users/${userToDelete.id}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Silme işlemi başarısız")
            }

            setUsers(users.filter(u => u.id !== userToDelete.id))
            showNotification("success", `${userToDelete.name || userToDelete.email} silindi.`)
        } catch (err: any) {
            showNotification("error", err.message)
        } finally {
            setDeleteDialogOpen(false)
            setUserToDelete(null)
        }
    }

    const confirmDelete = (user: User) => {
        if (user.email === "osman.cetlenbik@dpu.edu.tr") {
            showNotification("warning", "Ana yönetici silinemez!")
            return
        }
        setUserToDelete(user)
        setDeleteDialogOpen(true)
    }

    return (
        <div className="space-y-6">
            {/* Toast Notification */}
            {notification && (
                <Toast
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 flex items-center justify-center shadow-xl shadow-blue-500/20">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-white">Kullanıcı Yönetimi</h1>
                        <p className="text-slate-400 mt-1">Sisteme kayıtlı {users.length} kullanıcı</p>
                    </div>
                </div>
                {isAdmin && (
                    <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 gap-2 h-12 px-6 shadow-lg shadow-blue-500/20">
                                <UserPlus className="w-5 h-5" />
                                Yeni Kullanıcı
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-slate-800 border-slate-700">
                            <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 text-white">
                                    <UserPlus className="w-5 h-5 text-blue-400" />
                                    Yeni Kullanıcı Ekle
                                </DialogTitle>
                                <DialogDescription className="text-slate-400">
                                    Sisteme giriş yapabilecek yeni bir kullanıcı ekleyin.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleAddUser} className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-slate-300">E-posta Adresi</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                                        <Input
                                            type="email"
                                            placeholder="ornek@dpu.edu.tr"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="pl-11 h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Ad Soyad</Label>
                                    <Input
                                        type="text"
                                        placeholder="Ad Soyad"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="h-12 bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500 rounded-xl"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-slate-300">Rol</Label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: "HOCA", label: "Öğr. Gör.", icon: GraduationCap },
                                            { value: "MUDUR_YRD", label: "Müdür Yrd.", icon: Star },
                                            { value: "MUDUR", label: "Müdür", icon: Crown }
                                        ].map((r) => (
                                            <button
                                                key={r.value}
                                                type="button"
                                                onClick={() => setRole(r.value)}
                                                className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-2 ${role === r.value
                                                        ? "bg-blue-500/20 border-blue-500 text-blue-400"
                                                        : "border-slate-600 text-slate-400 hover:border-slate-500"
                                                    }`}
                                            >
                                                <r.icon className="w-5 h-5" />
                                                <span className="text-xs font-medium">{r.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <DialogFooter className="gap-2">
                                    <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)} className="border-slate-600 text-slate-300">
                                        İptal
                                    </Button>
                                    <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                                        {loading ? "Ekleniyor..." : "Ekle"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {/* Role Filter Stats */}
            <div className="grid grid-cols-4 gap-3">
                <button
                    onClick={() => setSelectedRole(null)}
                    className={`p-4 rounded-xl border transition-all ${!selectedRole ? "bg-slate-700/50 border-slate-500" : "bg-slate-800/30 border-slate-700/50 hover:border-slate-600"
                        }`}
                >
                    <p className="text-2xl font-bold text-white">{users.length}</p>
                    <p className="text-sm text-slate-400">Tümü</p>
                </button>
                <button
                    onClick={() => setSelectedRole(selectedRole === "MUDUR" ? null : "MUDUR")}
                    className={`p-4 rounded-xl border transition-all ${selectedRole === "MUDUR" ? "bg-purple-500/20 border-purple-500" : "bg-slate-800/30 border-slate-700/50 hover:border-purple-500/50"
                        }`}
                >
                    <p className="text-2xl font-bold text-purple-400">{mudurCount}</p>
                    <p className="text-sm text-slate-400">Müdür</p>
                </button>
                <button
                    onClick={() => setSelectedRole(selectedRole === "MUDUR_YRD" ? null : "MUDUR_YRD")}
                    className={`p-4 rounded-xl border transition-all ${selectedRole === "MUDUR_YRD" ? "bg-indigo-500/20 border-indigo-500" : "bg-slate-800/30 border-slate-700/50 hover:border-indigo-500/50"
                        }`}
                >
                    <p className="text-2xl font-bold text-indigo-400">{mudurYrdCount}</p>
                    <p className="text-sm text-slate-400">Müdür Yrd.</p>
                </button>
                <button
                    onClick={() => setSelectedRole(selectedRole === "HOCA" ? null : "HOCA")}
                    className={`p-4 rounded-xl border transition-all ${selectedRole === "HOCA" ? "bg-blue-500/20 border-blue-500" : "bg-slate-800/30 border-slate-700/50 hover:border-blue-500/50"
                        }`}
                >
                    <p className="text-2xl font-bold text-blue-400">{hocaCount}</p>
                    <p className="text-sm text-slate-400">Öğr. Gör.</p>
                </button>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <Input
                    placeholder="İsim veya e-posta ile ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 rounded-xl text-lg"
                />
            </div>

            {/* User Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredUsers.map((user) => {
                    const roleConfig = getRoleConfig(user.role)
                    const RoleIcon = roleConfig.icon

                    return (
                        <Card
                            key={user.id}
                            className={`bg-gradient-to-br ${roleConfig.accent} to-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-all duration-300 overflow-hidden group`}
                        >
                            <CardContent className="p-5">
                                <div className="flex items-start gap-4">
                                    <div className={`w-14 h-14 rounded-2xl ${roleConfig.bg} flex items-center justify-center text-white font-bold text-lg shadow-lg group-hover:scale-105 transition-transform`}>
                                        {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-white text-lg truncate">{user.name || "İsimsiz"}</h3>
                                        <p className="text-sm text-slate-400 truncate">{user.email}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${roleConfig.badge}`}>
                                                <RoleIcon className="w-3.5 h-3.5" />
                                                {getRoleDisplayName(user.role)}
                                            </span>
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => confirmDelete(user)}
                                        disabled={user.email === "osman.cetlenbik@dpu.edu.tr"}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                                {user.courses.length > 0 && (
                                    <div className="mt-4 pt-4 border-t border-slate-700/50">
                                        <div className="flex items-center gap-2 text-slate-400">
                                            <BookOpen className="w-4 h-4" />
                                            <span className="text-sm">{user.courses.length} ders</span>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )
                })}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-16">
                    <div className="w-20 h-20 rounded-full bg-slate-800/50 flex items-center justify-center mx-auto mb-4">
                        <Search className="w-10 h-10 text-slate-600" />
                    </div>
                    <p className="text-slate-400 text-lg">Kullanıcı bulunamadı</p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent className="bg-slate-800 border-slate-700">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-400">
                            <AlertTriangle className="w-5 h-5" />
                            Kullanıcıyı Sil
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-400">
                            <strong className="text-white">{userToDelete?.name || userToDelete?.email}</strong> kullanıcısını silmek istediğinize emin misiniz?
                            <br /><br />
                            Bu işlem geri alınamaz ve kullanıcıya ait tüm dersler ve dosyalar da silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="border-slate-600 text-slate-300">İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteUser}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Evet, Sil
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
