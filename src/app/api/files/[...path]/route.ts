import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ path: string[] }> }
) {
    const session = await auth()

    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { path: pathSegments } = await params
    const filePath = pathSegments.join("/")

    // Security: Prevent path traversal attacks
    // Check for directory traversal patterns
    const hasTraversal = pathSegments.some(segment =>
        segment === ".." ||
        segment === "." ||
        segment.includes("..") ||
        segment.startsWith("~")
    )

    if (hasTraversal) {
        return NextResponse.json({ error: "Invalid path" }, { status: 400 })
    }

    // Security: Only allow access to uploads folder
    if (!filePath.startsWith("uploads/") && !pathSegments[0]?.includes("uploads")) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const fullPath = path.join(process.cwd(), ...pathSegments)

    // Additional security: Ensure resolved path is within uploads directory
    const uploadsDir = path.join(process.cwd(), "uploads")
    const resolvedPath = path.resolve(fullPath)
    if (!resolvedPath.startsWith(uploadsDir)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    try {
        if (!fs.existsSync(fullPath)) {
            return NextResponse.json({ error: "File not found" }, { status: 404 })
        }

        const fileBuffer = fs.readFileSync(fullPath)
        const fileName = pathSegments[pathSegments.length - 1]

        return new NextResponse(fileBuffer, {
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": `inline; filename="${encodeURIComponent(fileName)}"`,
                "Cache-Control": "private, max-age=3600"
            }
        })
    } catch (error) {
        console.error("File serve error:", error)
        return NextResponse.json({ error: "Server error" }, { status: 500 })
    }
}
