import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

// GET - Program çıktılarını listele
export async function GET() {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const plos = await prisma.programOutcome.findMany({
            include: {
                courses: {
                    include: {
                        course: { select: { code: true, name: true } }
                    }
                }
            },
            orderBy: { code: "asc" }
        })

        return NextResponse.json(plos)
    } catch (error) {
        console.error("Error fetching PLOs:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// POST - Yeni PLO oluştur
export async function POST(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user || (user.role !== "MUDUR" && user.role !== "MUDUR_YRD")) {
            return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 })
        }

        const body = await req.json()
        const { code, description } = body

        if (!code || !description) {
            return NextResponse.json({ error: "Kod ve açıklama gerekli" }, { status: 400 })
        }

        const plo = await prisma.programOutcome.create({
            data: { code, description }
        })

        return NextResponse.json(plo, { status: 201 })
    } catch (error) {
        console.error("Error creating PLO:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}

// DELETE - PLO sil
export async function DELETE(req: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user || user.role !== "MUDUR") {
            return NextResponse.json({ error: "Yetkiniz yok" }, { status: 403 })
        }

        const { searchParams } = new URL(req.url)
        const ploId = searchParams.get("id")

        if (!ploId) {
            return NextResponse.json({ error: "PLO ID gerekli" }, { status: 400 })
        }

        await prisma.programOutcome.delete({
            where: { id: ploId }
        })

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error("Error deleting PLO:", error)
        return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
}
