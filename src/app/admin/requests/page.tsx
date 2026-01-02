import { prisma } from "@/lib/prisma"
import { DeleteRequestActions } from "./delete-request-actions"
import { DeleteRequestsClient } from "./requests-client"

export const dynamic = "force-dynamic"

interface DeleteRequestWithReason {
    id: string
    reason: string
    status: string
    rejectionReason: string | null
    createdAt: Date
    fileId: string
    requesterId: string
}

export default async function DeleteRequestsPage() {
    // Get full data with relations (rejectionReason is already included)
    const requestsData = await prisma.deleteRequest.findMany({
        include: {
            file: {
                include: {
                    exam: {
                        include: { course: { include: { instructor: true } } }
                    }
                }
            },
            requester: true
        },
        orderBy: { createdAt: "desc" }
    })

    // Format for client
    const requests = requestsData.map(req => ({
        id: req.id,
        reason: req.reason,
        status: req.status,
        rejectionReason: req.rejectionReason,
        createdAt: req.createdAt.toISOString(),
        file: {
            id: req.file.id,
            filename: req.file.filename,
            type: req.file.type,
            exam: {
                id: req.file.exam.id,
                name: req.file.exam.name,
                course: {
                    id: req.file.exam.course.id,
                    code: req.file.exam.course.code,
                    instructor: {
                        id: req.file.exam.course.instructor.id,
                        name: req.file.exam.course.instructor.name
                    }
                }
            }
        },
        requester: {
            id: req.requester.id,
            name: req.requester.name
        }
    }))

    // Get approved count from ActivityLog
    const approvedCountResult = await prisma.$queryRaw<[{ count: number }]>`
        SELECT COUNT(*) as count FROM ActivityLog WHERE action = 'APPROVE_DELETE'
    `
    const approvedCount = Number(approvedCountResult[0]?.count || 0)

    const pendingRequests = requests.filter(r => r.status === "PENDING")
    const rejectedRequests = requests.filter(r => r.status === "REJECTED")

    // Generate action components for each pending request
    const actions = pendingRequests.map(req => (
        <DeleteRequestActions key={req.id} requestId={req.id} />
    ))

    return (
        <DeleteRequestsClient
            pendingRequests={pendingRequests}
            rejectedRequests={rejectedRequests}
            approvedCount={approvedCount}
            actions={actions}
        />
    )
}
