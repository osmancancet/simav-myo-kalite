"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { UserPlus, Users, Trash2, Shield, GraduationCap } from "lucide-react"

interface User {
    id: string
    email: string
    name: string | null
    role: string
    courses: { id: string; code: string; name: string }[]
}

interface UserManagementProps {
    users: User[]
}

export function UserManagement({ users: initialUsers }: UserManagementProps) {
    const [users, setUsers] = useState(initialUsers)
    const [email, setEmail] = useState("")
    const [name, setName] = useState("")
    const [role, setRole] = useState("INSTRUCTOR")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState("")

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")
        setSuccess("")

        if (!email.endsWith("@dpu.edu.tr")) {
            setError("Sadece @dpu.edu.tr uzantılı e-postalar eklenebilir.")
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
            setSuccess("Kullanıcı başarıyla eklendi!")
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteUser = async (userId: string, userEmail: string) => {
        if (userEmail === "osman.cetlenbik@dpu.edu.tr") {
            setError("Ana admin silinemez!")
            return
        }

        if (!confirm("Bu kullanıcıyı silmek istediğinize emin misiniz?")) return

        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: "DELETE"
            })

            if (!res.ok) throw new Error("Silme işlemi başarısız")

            setUsers(users.filter(u => u.id !== userId))
            setSuccess("Kullanıcı silindi!")
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <div className="space-y-6">
            {/* Add User Form */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserPlus className="w-5 h-5" />
                        Yeni Kullanıcı Ekle
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAddUser} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">E-posta</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="ornek@dpu.edu.tr"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="name">Ad Soyad</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="Ad Soyad"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="role">Rol</Label>
                                <select
                                    id="role"
                                    value={role}
                                    onChange={(e) => setRole(e.target.value)}
                                    className="w-full h-10 px-3 border rounded-md"
                                >
                                    <option value="INSTRUCTOR">Eğitmen</option>
                                    <option value="ADMIN">Yönetici</option>
                                </select>
                            </div>
                        </div>

                        {error && <p className="text-sm text-red-600 bg-red-50 p-2 rounded">{error}</p>}
                        {success && <p className="text-sm text-green-600 bg-green-50 p-2 rounded">{success}</p>}

                        <Button type="submit" disabled={loading} className="bg-blue-600 hover:bg-blue-700">
                            {loading ? "Ekleniyor..." : "Kullanıcı Ekle"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* User List */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Kayıtlı Kullanıcılar ({users.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="divide-y">
                        {users.map((user) => (
                            <div key={user.id} className="py-4 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${user.role === "ADMIN" ? "bg-purple-100" : "bg-blue-100"}`}>
                                        {user.role === "ADMIN" ? (
                                            <Shield className="w-5 h-5 text-purple-600" />
                                        ) : (
                                            <GraduationCap className="w-5 h-5 text-blue-600" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">{user.name || user.email}</p>
                                        <p className="text-sm text-gray-500">{user.email}</p>
                                        <p className="text-xs text-gray-400">
                                            {user.role === "ADMIN" ? "Yönetici" : "Eğitmen"}
                                            {user.courses.length > 0 && ` • ${user.courses.length} ders`}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                    onClick={() => handleDeleteUser(user.id, user.email)}
                                    disabled={user.email === "osman.cetlenbik@dpu.edu.tr"}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
