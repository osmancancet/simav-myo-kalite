require("dotenv").config()
const { PrismaClient } = require("@prisma/client")
const prisma = new PrismaClient()

async function main() {
    console.log("Seeding...")

    // Create Admin
    const admin = await prisma.user.upsert({
        where: { email: "admin@dpu.edu.tr" },
        update: {},
        create: {
            email: "admin@dpu.edu.tr",
            name: "Admin User",
            role: "ADMIN",
        },
    })
    console.log("Created Admin:", admin.email)

    // Create Instructor
    const instructor = await prisma.user.upsert({
        where: { email: "hoca@dpu.edu.tr" },
        update: {},
        create: {
            email: "hoca@dpu.edu.tr",
            name: "Örnek Hoca",
            role: "INSTRUCTOR",
        },
    })
    console.log("Created Instructor:", instructor.email)

    // Create Courses
    await prisma.course.upsert({
        where: { code: "BIL101" },
        update: {},
        create: {
            code: "BIL101",
            name: "Bilgisayar Programlama I",
            instructorId: instructor.id,
        },
    })
    console.log("Created Course BIL101")

    await prisma.course.upsert({
        where: { code: "BIL202" },
        update: {},
        create: {
            code: "BIL202",
            name: "Veri Tabanı Yönetimi",
            instructorId: instructor.id,
        },
    })
    console.log("Created Course BIL202")
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
