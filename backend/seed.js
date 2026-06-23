import fs from 'fs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log("⚙️ Rozpoczynam wczytywanie danych z baza.json bezpośrednio do PostgreSQL...");
    if (!fs.existsSync('./baza.json')) {
        console.error("❌ Błąd: Brak pliku 'baza.json' w głównym folderze backendu!");
        process.exit(1);
    }
    const rawData = fs.readFileSync('./baza.json', 'utf-8');
    const idolsData = JSON.parse(rawData);
    for (const idol of idolsData) {
        await prisma.idol.upsert({
            where: { name: idol.name },
            update: {
                group: idol.group,
                images: idol.images,
                description: idol.description || null
            },
            create: {
                name: idol.name,
                group: idol.group,
                images: idol.images,
                description: idol.description || null
            }
        });
        
        console.log(`✅ Zsynchronizowano w bazie: ${idol.name}`);
    }

    console.log('🚀 Wszystkie dane z baza.json zostały pomyślnie zapisane w PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Wystąpił błąd podczas seedowania bazy:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });