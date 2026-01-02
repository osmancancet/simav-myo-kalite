import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/roles"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Params = {
    params: Promise<{ requestId: string }>
}

// POST - Approve or reject delete request
export async function POST(req: NextRequest, { params }: Params) {
    try {
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

        const { requestId } = await params
        const body = await req.json()
        const action = body.action
        const rejectionReason = body.rejectionReason

        if (!["approve", "reject"].includes(action)) {
            return NextResponse.json({ error: "Geçersiz işlem" }, { status: 400 })
        }

        // Rejection requires a reason
        if (action === "reject" && !rejectionReason) {
            return NextResponse.json({ error: "Red gerekçesi zorunludur" }, { status: 400 })
        }

        const deleteRequest = await prisma.deleteRequest.findUnique({
            where: { id: requestId },
            include: {
                file: {
                    include: {
                        exam: {
                            include: {
                                course: true
                            }
                        }
                    }
                }
            }
        })

        if (!deleteRequest) {
            return NextResponse.json({ error: "Talep bulunamadı" }, { status: 404 })
        }

        if (deleteRequest.status !== "PENDING") {
            return NextResponse.json({ error: "Bu talep zaten işlenmiş" }, { status: 400 })
        }

        if (action === "approve") {
            // Delete the actual file from disk
            try {
                const filePath = path.join(process.cwd(), deleteRequest.file.path)
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath)
                }
            } catch (err) {
                console.error("File delete error:", err)
            }

            // Send success notification using raw query
            await prisma.$executeRaw`
                INSERT INTO Notification (id, userId, title, message, type, read, link, createdAt)
                VALUES (
                    ${`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
                    ${deleteRequest.requesterId},
                    ${"Silme Talebi Onaylandı"},
                    ${`"${deleteRequest.file.filename}" dosyası için gönderdiğiniz silme talebi onaylandı. Dosya sistemden silindi.`},
                    ${"SUCCESS"},
                    ${false},
                    ${`/hoca/ders/${deleteRequest.file.exam.courseId}`},
                    ${new Date().toISOString()}
                )
            `

            // Log the approval action
            await prisma.$executeRaw`
                INSERT INTO ActivityLog (id, userId, action, entityType, entityId, details, createdAt)
                VALUES (
                    ${`act_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
                    ${user.id},
                    ${"APPROVE_DELETE"},
                    ${"FILE"},
                    ${deleteRequest.fileId},
                    ${`Silme talebi onaylandı: ${deleteRequest.file.filename} (${deleteRequest.reason})`},
                    ${new Date().toISOString()}
                )
            `

            // Delete the examFile (cascade will delete DeleteRequest)
            await prisma.examFile.delete({
                where: { id: deleteRequest.fileId }
            })

            return NextResponse.json({ success: true, message: "Dosya silindi" })
        } else {
            // Update status to rejected with reason using raw query
            await prisma.$executeRaw`
                UPDATE DeleteRequest
                SET status = 'REJECTED', rejectionReason = ${rejectionReason}
                WHERE id = ${requestId}
            `

            // Send rejection notification using raw query
            await prisma.$executeRaw`
                INSERT INTO Notification (id, userId, title, message, type, read, link, createdAt)
                VALUES (
                    ${`notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`},
                    ${deleteRequest.requesterId},
                    ${"Silme Talebi Reddedildi"},
                    ${`"${deleteRequest.file.filename}" dosyası için gönderdiğiniz silme talebi reddedildi. Gerekçe: ${rejectionReason}`},
                    ${"WARNING"},
                    ${false},
                    ${`/hoca/ders/${deleteRequest.file.exam.courseId}`},
                    ${new Date().toISOString()}
                )
            `

            return NextResponse.json({ success: true, message: "Talep reddedildi" })
        }
    } catch (error) {
        console.error("Delete request error:", error)
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
    }
}
