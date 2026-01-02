import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST - Create delete request
export async function POST(req: NextRequest) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email }
    })

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const { fileId, reason } = await req.json()

    if (!fileId || !reason) {
        return NextResponse.json({ error: "Dosya ve sebep gerekli" }, { status: 400 })
    }

    // Get file and verify ownership
    const file = await prisma.examFile.findUnique({
        where: { id: fileId },
        include: {
            exam: {
                include: {
                    course: { include: { instructor: true } }
                }
            },
            deleteRequest: true
        }
    })

    if (!file) {
        return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 404 })
    }

    // Check if user owns the course or is admin
    const isOwner = file.exam.course.instructor.email === session.user.email
    const isAdmin = isAdminRole(user.role)

    if (!isOwner && !isAdmin) {
        return NextResponse.json({ error: "Bu dosya için talep oluşturma yetkiniz yok" }, { status: 403 })
    }

    // Check if there's already a pending request
    if (file.deleteRequest) {
        return NextResponse.json({ error: "Bu dosya için zaten bir talep mevcut" }, { status: 409 })
    }

    const deleteRequest = await prisma.deleteRequest.create({
        data: {
            reason,
            fileId,
            requesterId: user.id
        }
    })

    return NextResponse.json(deleteRequest)
}

// GET - List delete requests (admin only)
export async function GET() {
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

    const requests = await prisma.deleteRequest.findMany({
        include: {
            file: {
                include: {
                    exam: {
                        include: {
                            course: { include: { instructor: true } }
                        }
                    }
                }
            },
            requester: true
        },
        orderBy: { createdAt: "desc" }
    })

    return NextResponse.json(requests)
}
