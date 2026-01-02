import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { UserManagement } from "./user-management"

export const dynamic = "force-dynamic"

export default async function UsersPage() {
    const session = await auth()

    const currentUser = await prisma.user.findUnique({
        where: { email: session?.user?.email || "" }
    })

    const users = await prisma.user.findMany({
        include: {
            courses: true,
        },
        orderBy: { name: "asc" }
    })

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Kullanıcı Yönetimi</h1>
                <p className="text-slate-500">Sisteme giriş yapabilecek kullanıcıları buradan yönetin</p>
            </div>
            <UserManagement users={users} currentUserRole={currentUser?.role || "HOCA"} />
        </div>
    )
}
