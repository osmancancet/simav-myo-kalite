// User roles
export const ROLES = {
    HOCA: "HOCA",
    MUDUR: "MUDUR",
    MUDUR_YRD: "MUDUR_YRD"
} as const

export type UserRole = typeof ROLES[keyof typeof ROLES]

// Roles with admin privileges
export const ADMIN_ROLES: UserRole[] = [ROLES.MUDUR, ROLES.MUDUR_YRD]

// Check if role has admin privileges (can access admin panel)
export function isAdminRole(role: string): boolean {
    return ADMIN_ROLES.includes(role as UserRole)
}

// Check if role is MUDUR or MUDUR_YRD (can add/delete users - both have same permissions)
export function isMudurRole(role: string): boolean {
    return role === ROLES.MUDUR || role === ROLES.MUDUR_YRD
}

// Get display name for role
export function getRoleDisplayName(role: string): string {
    switch (role) {
        case ROLES.MUDUR:
            return "Müdür"
        case ROLES.MUDUR_YRD:
            return "Müdür Yardımcısı"
        case ROLES.HOCA:
            return "Eğitmen"
        default:
            return role
    }
}

// Get role badge color classes
export function getRoleBadgeColor(role: string): string {
    switch (role) {
        case ROLES.MUDUR:
            return "bg-purple-100 text-purple-700"
        case ROLES.MUDUR_YRD:
            return "bg-indigo-100 text-indigo-700"
        case ROLES.HOCA:
            return "bg-blue-100 text-blue-700"
        default:
            return "bg-gray-100 text-gray-700"
    }
}
