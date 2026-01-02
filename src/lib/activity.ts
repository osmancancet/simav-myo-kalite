import { prisma } from "@/lib/prisma"

export type ActivityAction = "UPLOAD" | "DELETE" | "CREATE" | "UPDATE" | "LOGIN" | "LOGOUT"
export type EntityType = "COURSE" | "EXAM" | "FILE" | "USER" | "SYSTEM"

interface LogActivityParams {
    userId: string
    action: ActivityAction
    entityType: EntityType
    entityId?: string
    details?: string
}

export async function logActivity({
    userId,
    action,
    entityType,
    entityId,
    details
}: LogActivityParams) {
    try {
        await prisma.activityLog.create({
            data: {
                userId,
                action,
                entityType,
                entityId,
                details
            }
        })
    } catch (error) {
        console.error("Activity log error:", error)
    }
}

export async function logLogin(userId: string, ipAddress?: string) {
    try {
        await logActivity({
            userId,
            action: "LOGIN",
            entityType: "USER",
            details: ipAddress ? `IP: ${ipAddress}` : undefined
        })
    } catch (error) {
        console.error("Login log error:", error)
    }
}
