import { handlers } from "@/auth" // Using alias we set up in tsconfig

export const runtime = "nodejs"

export const { GET, POST } = handlers
