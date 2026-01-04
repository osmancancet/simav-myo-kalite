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
import { BookOpen, Plus, Trash2, FileText, User, Search, CheckCircle2, XCircle, AlertTriangle } from "lucide-react"

interface Course {
    id: string
    code: string
    name: string
    instructor: { id: string; name: string | null; email: string }
    exams: { id: string; files: { id: string }[] }[]
    semester?: { id: string; name: string }
}

interface Instructor {
    id: string
    email: string
    name: string | null
}

interface CourseManagementProps {
    courses: Course[]
    instructors: Instructor[]
}

// Notification Component
function Notification({ type, message, onClose }: { type: "success" | "error" | "warning"; message: string; onClose: () => void }) {
    const styles = {
        success: "bg-emerald-50 border-emerald-200 text-emerald-800",
        error: "bg-red-50 border-red-200 text-red-800",
        warning: "bg-amber-50 border-amber-200 text-amber-800"
    }
    const icons = {
        success: <CheckCircle2 className="w-5 h-5 text-emerald-500" />,
        error: <XCircle className="w-5 h-5 text-red-500" />,
        warning: <AlertTriangle className="w-5 h-5 text-amber-500" />
    }

    return (
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${styles[type]} animate-in slide-in-from-top-2 duration-300`}>
            {icons[type]}
            <span className="flex-1 font-medium">{message}</span>
            <button onClick={onClose} className="hover:opacity-70">
                <XCircle className="w-4 h-4" />
            </button>
        </div>
    )
}

export function CourseManagement({ courses: initialCourses, instructors }: CourseManagementProps) {
    const [courses, setCourses] = useState(initialCourses)
    const [code, setCode] = useState("")
    const [name, setName] = useState("")
    const [instructorId, setInstructorId] = useState("")
    const [loading, setLoading] = useState(false)
    const [notification, setNotification] = useState<{ type: "success" | "error" | "warning"; message: string } | null>(null)
    const [searchTerm, setSearchTerm] = useState("")
    const [addDialogOpen, setAddDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [courseToDelete, setCourseToDelete] = useState<Course | null>(null)

    const showNotification = (type: "success" | "error" | "warning", message: string) => {
        setNotification({ type, message })
        setTimeout(() => setNotification(null), 5000)
    }

    const filteredCourses = courses.filter(course =>
        course.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.name.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const handleAddCourse = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const res = await fetch("/api/admin/courses", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code, name, instructorId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Ders eklenemedi")
            }

            const newCourse = await res.json()
            const instructor = instructors.find(i => i.id === instructorId)
            setCourses([...courses, { ...newCourse, instructor: instructor || { id: "", name: null, email: "" }, exams: [] }])
            setCode("")
            setName("")
            setInstructorId("")
            setAddDialogOpen(false)
            showNotification("success", `${code} - ${name} dersi eklendi!`)
        } catch (err: any) {
            showNotification("error", err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleDeleteCourse = async () => {
        if (!courseToDelete) return

        try {
            const res = await fetch(`/api/admin/courses/${courseToDelete.id}`, {
                method: "DELETE"
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || "Silme işlemi başarısız")
            }

            setCourses(courses.filter(c => c.id !== courseToDelete.id))
            showNotification("success", `${courseToDelete.code} dersi silindi.`)
        } catch (err: any) {
            showNotification("error", err.message)
        } finally {
            setDeleteDialogOpen(false)
            setCourseToDelete(null)
        }
    }

    return (
        <div className="space-y-6">
            {/* Notification */}
            {notification && (
                <Notification
                    type={notification.type}
                    message={notification.message}
                    onClose={() => setNotification(null)}
                />
            )}

            {/* Header with Add Button */}
            <div className="flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 w-5 h-5 text-slate-400" />
                    <Input
                        placeholder="Ders ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-11 bg-white border-slate-200"
                    />
                </div>

                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-green-600 hover:bg-green-700 gap-2 h-11 px-6">
                            <Plus className="w-5 h-5" />
                            Yeni Ders
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                                <BookOpen className="w-5 h-5 text-green-600" />
                                Yeni Ders Ekle
                            </DialogTitle>
                            <DialogDescription>
                                Sisteme yeni bir ders ekleyin ve eğitmen atayın.
                            </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleAddCourse} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="code">Ders Kodu</Label>
                                    <Input
                                        id="code"
                                        placeholder="BIL101"
                                        value={code}
                                        onChange={(e) => setCode(e.target.value.toUpperCase())}
                                        required
                                    />
                                </div>
                                <div className="space-y-2 col-span-2">
                                    <Label htmlFor="name">Ders Adı</Label>
                                    <Input
                                        id="name"
                                        placeholder="Bilgisayar Programlama"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="instructor">Eğitmen</Label>
                                <select
                                    id="instructor"
                                    value={instructorId}
                                    onChange={(e) => setInstructorId(e.target.value)}
                                    className="w-full h-10 px-3 border rounded-md bg-white"
                                    required
                                >
                                    <option value="">Seçiniz...</option>
                                    {instructors.map(instructor => (
                                        <option key={instructor.id} value={instructor.id}>
                                            {instructor.name || instructor.email}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                                    İptal
                                </Button>
                                <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
                                    {loading ? "Ekleniyor..." : "Ekle"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="border-0 shadow-md hover:shadow-lg transition-all group overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-green-500 to-emerald-500" />
                        <CardContent className="pt-5">
                            <div className="flex items-start justify-between">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                        <span className="text-white font-bold text-xs">{course.code.slice(0, 3)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{course.code}</h3>
                                        <p className="text-sm text-slate-600">{course.name}</p>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-opacity"
                                    onClick={() => {
                                        setCourseToDelete(course)
                                        setDeleteDialogOpen(true)
                                    }}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <User className="w-4 h-4" />
                                    <span className="truncate max-w-[120px]">{course.instructor.name || course.instructor.email}</span>
                                </div>
                                <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                                    <FileText className="w-3 h-3" />
                                    <span className="text-xs font-medium">{course.exams.reduce((acc, e) => acc + e.files.length, 0)}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredCourses.length === 0 && (
                <div className="text-center py-12">
                    <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <p className="text-slate-400">Ders bulunamadı</p>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            Dersi Sil
                        </AlertDialogTitle>
                        <AlertDialogDescription className="text-slate-600">
                            <strong>{courseToDelete?.code}</strong> dersini silmek istediğinize emin misiniz?
                            <br /><br />
                            Bu işlem geri alınamaz ve derse ait <strong>{courseToDelete?.exams.reduce((acc, e) => acc + e.files.length, 0) || 0} dosya</strong> da silinecektir.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>İptal</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCourse}
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
