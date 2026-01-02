import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = {
    params: Promise<{ id: string }>
}

// PATCH - Update semester (set active, etc.)
export async function PATCH(req: NextRequest, { params }: Params) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user || !isAdminRole(user.role)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params
    const { isActive } = await req.json()

    // If setting as active, first deactivate all others
    if (isActive) {
        await prisma.semester.updateMany({
            where: { isActive: true },
            data: { isActive: false }
        })
    }

    const semester = await prisma.semester.update({
        where: { id },
        data: { isActive }
    })

    return NextResponse.json(semester)
}
