import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create initial semester: 2025-2026 Bahar (active)
    const semester = await prisma.semester.upsert({
        where: { name: '2025-2026 Bahar' },
        update: {},
        create: {
            name: '2025-2026 Bahar',
            year: '2025-2026',
            term: 'BAHAR',
            isActive: true
        }
    })
    console.log('Created semester:', semester.name)

    // Create admin user
    const admin = await prisma.user.upsert({
        where: { email: 'osman.cetlenbik@dpu.edu.tr' },
        update: {},
        create: {
            email: 'osman.cetlenbik@dpu.edu.tr',
            name: 'Osman Can Çetlenbik',
            role: 'MUDUR'
        }
    })
    console.log('Created admin:', admin.email)

    // Create test hoca
    const hoca = await prisma.user.upsert({
        where: { email: 'oskitocan55@gmail.com' },
        update: {},
        create: {
            email: 'oskitocan55@gmail.com',
            name: 'Test Öğretim Görevlisi',
            role: 'HOCA'
        }
    })
    console.log('Created hoca:', hoca.email)

    console.log('Seeding completed!')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
