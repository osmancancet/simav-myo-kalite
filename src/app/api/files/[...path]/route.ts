import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

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
    const fileUrl = pathSegments.join("/")

    // Check if this is a Vercel Blob URL (new format)
    if (fileUrl.startsWith("https://") || fileUrl.includes("blob.vercel-storage.com")) {
        // For Blob URLs, redirect to the actual URL
        return NextResponse.redirect(fileUrl)
    }

    // For legacy local file paths starting with "uploads/"
    // Since we're on Vercel, local files don't exist
    // Return an error directing to upgrade
    return NextResponse.json({
        error: "File not found. This file may have been uploaded before the cloud storage migration."
    }, { status: 404 })
}
