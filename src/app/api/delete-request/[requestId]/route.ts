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

            // Send success notification
            await prisma.notification.create({
                data: {
                    userId: deleteRequest.requesterId,
                    title: "Silme Talebi Onaylandı",
                    message: `"${deleteRequest.file.filename}" dosyası için gönderdiğiniz silme talebi onaylandı. Dosya sistemden silindi.`,
                    type: "SUCCESS",
                    link: `/hoca/ders/${deleteRequest.file.exam.courseId}`
                }
            })

            // Log the approval action
            await prisma.activityLog.create({
                data: {
                    userId: user.id,
                    action: "APPROVE_DELETE",
                    entityType: "FILE",
                    entityId: deleteRequest.fileId,
                    details: `Silme talebi onaylandı: ${deleteRequest.file.filename} (${deleteRequest.reason})`
                }
            })

            // Delete the examFile (cascade will delete DeleteRequest)
            await prisma.examFile.delete({
                where: { id: deleteRequest.fileId }
            })

            return NextResponse.json({ success: true, message: "Dosya silindi" })
        } else {
            // Update status to rejected with reason
            await prisma.deleteRequest.update({
                where: { id: requestId },
                data: {
                    status: 'REJECTED',
                    rejectionReason: rejectionReason
                }
            })

            // Send rejection notification
            await prisma.notification.create({
                data: {
                    userId: deleteRequest.requesterId,
                    title: "Silme Talebi Reddedildi",
                    message: `"${deleteRequest.file.filename}" dosyası için gönderdiğiniz silme talebi reddedildi. Gerekçe: ${rejectionReason}`,
                    type: "WARNING",
                    link: `/hoca/ders/${deleteRequest.file.exam.courseId}`
                }
            })

            return NextResponse.json({ success: true, message: "Talep reddedildi" })
        }
    } catch (error) {
        console.error("Delete request error:", error)
        return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 })
    }
}
