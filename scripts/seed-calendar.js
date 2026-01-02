const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const academicEvents = [
    { title: "Müfredatlara Ders Ekleme Taleplerin Son Günü", startDate: new Date("2026-01-09"), type: "DEADLINE", description: "Ders ekleme talepleri için son gün" },
    { title: "Kayıt Yenileme Başlangıcı", startDate: new Date("2026-02-02"), endDate: new Date("2026-02-06"), type: "REGISTRATION", description: "Kayıt yenileme dönemi" },
    { title: "Derslerin Başlaması", startDate: new Date("2026-02-09"), type: "SEMESTER", description: "Bahar dönemi dersleri başlıyor" },
    { title: "Ekle-Sil Dönemi", startDate: new Date("2026-02-09"), endDate: new Date("2026-02-11"), type: "REGISTRATION", description: "Ders ekle-sil dönemi" },
    { title: "Danışman Onayı", startDate: new Date("2026-02-02"), endDate: new Date("2026-02-11"), type: "DEADLINE", description: "Danışman onay dönemi" },
    { title: "Mazeretli Kayıt Başvurusu", startDate: new Date("2026-02-12"), endDate: new Date("2026-02-13"), type: "REGISTRATION", description: "Mazeretli kayıt başvurusu" },
    { title: "Mazeretli Kayıt Değerlendirmesi", startDate: new Date("2026-02-16"), type: "DEADLINE", description: "Mazeretli kayıt başvuruları değerlendirilmesi" },
    { title: "Mazeretli Kayıt", startDate: new Date("2026-02-17"), endDate: new Date("2026-02-19"), type: "REGISTRATION", description: "Mazereti kabul edilenler için kayıt" },
    { title: "Vize Sınavları", startDate: new Date("2026-03-30"), endDate: new Date("2026-04-04"), type: "EXAM", description: "Yarıyıl içi sınavları" },
    { title: "Vize Notları Son İlan Tarihi", startDate: new Date("2026-04-26"), type: "DEADLINE", description: "Yarıyıl içi sınavları not ilan son tarih" },
    { title: "Derslerin Sonu", startDate: new Date("2026-06-06"), type: "SEMESTER", description: "Bahar dönemi dersleri sona eriyor" },
    { title: "Final Sınavları", startDate: new Date("2026-06-08"), endDate: new Date("2026-06-15"), type: "EXAM", description: "Yarıyıl sonu sınavları" },
    { title: "Final Notları Son İlan Tarihi", startDate: new Date("2026-06-18"), type: "DEADLINE", description: "Yarıyıl sonu sınavları ve ödev/proje not ilan son tarih" },
    { title: "Bütünleme Sınavları", startDate: new Date("2026-06-22"), endDate: new Date("2026-06-26"), type: "EXAM", description: "Bütünleme sınavları" },
    { title: "Bütünleme Notları Son İlan Tarihi", startDate: new Date("2026-06-28"), type: "DEADLINE", description: "Bütünleme sınavları not ilan son tarih" },
    { title: "Mezuniyet Sınavları", startDate: new Date("2026-07-02"), type: "EXAM", description: "Mezuniyet sınavları" },
    { title: "Mezuniyet Notları Son İlan Tarihi", startDate: new Date("2026-07-05"), type: "DEADLINE", description: "Mezuniyet sınavları not ilan son tarih" },
    { title: "Azami Öğrenim Süresini Tamamlayan Öğrencilerin Değerlendirmesi", startDate: new Date("2026-09-01"), type: "OTHER", description: "Azami süre değerlendirmesi" },
    { title: "Azami Süre 1. Ek Sınavları", startDate: new Date("2026-09-03"), endDate: new Date("2026-09-04"), type: "EXAM", description: "Azami süre sonu 1. ek sınavları" },
    { title: "Azami Süre 1. Ek Sınavları Notları Son İlan Tarihi", startDate: new Date("2026-09-07"), type: "DEADLINE", description: "Azami süre 1. ek sınavları not ilan son tarih" },
    { title: "Azami Süre 2. Ek Sınav Değerlendirmesi", startDate: new Date("2026-09-09"), type: "OTHER", description: "2. ek sınav hakkı verilecek öğrencilerin değerlendirilmesi" },
    { title: "Azami Süre 2. Ek Sınavları", startDate: new Date("2026-09-14"), endDate: new Date("2026-09-15"), type: "EXAM", description: "Azami süre sonu 2. ek sınavları" },
    { title: "Azami Süre 2. Ek Sınavları Notları Son İlan Tarihi", startDate: new Date("2026-09-17"), type: "DEADLINE", description: "Azami süre 2. ek sınavları not ilan son tarih" },
    { title: "Azami Süre Ek Sınavları Sonunda Değerlendirme", startDate: new Date("2026-09-18"), type: "OTHER", description: "Ek süre sınavları sonunda öğrencilerin durumlarının değerlendirilmesi" },
]

async function main() {
    console.log('Akademik takvim etkinlikleri ekleniyor...\n')

    // Get admin user to set as creator
    const admin = await prisma.user.findFirst({
        where: { role: 'MUDUR' }
    })

    if (!admin) {
        console.error('Hata: Admin kullanıcı bulunamadı!')
        return
    }

    console.log(`Oluşturan: ${admin.name || admin.email}\n`)

    for (const event of academicEvents) {
        await prisma.academicEvent.create({
            data: {
                ...event,
                createdById: admin.id
            }
        })
        console.log(`✓ ${event.title}`)
    }

    console.log(`\n✅ Toplam ${academicEvents.length} etkinlik eklendi!`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
