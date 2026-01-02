import { auth } from "@/auth"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ADMIN_ROLES = ["MUDUR", "MUDUR_YRD"]

export async function middleware(request: NextRequest) {
    const session = await auth()
    const isLoggedIn = !!session
    const pathname = request.nextUrl.pathname

    // Protected routes
    if (pathname.startsWith("/dashboard") || pathname.startsWith("/admin")) {
        if (!isLoggedIn) {
            return NextResponse.redirect(new URL("/login", request.url))
        }
    }

    // Admin routes - check for admin role
    if (pathname.startsWith("/admin")) {
        const userRole = session?.user?.role as string
        if (!ADMIN_ROLES.includes(userRole)) {
            return NextResponse.redirect(new URL("/dashboard", request.url))
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|uploads).*)"],
}
