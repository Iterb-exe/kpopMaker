import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();
async function seedDatabase() {
    try {
        const count = await prisma.idol.count();
        if (count === 0 && fs.existsSync('./baza.json')) {
            console.log("Baza jest pusta. Rozpoczynam automatyczne ładowanie danych z baza.json...");
            
            const rawData = fs.readFileSync('./baza.json', 'utf-8');
            const idolsData = JSON.parse(rawData);

            for (const idol of idolsData) {
                await prisma.idol.create({
                    data: {
                        name: idol.name,
                        group: idol.group,
                        images: idol.images,
                        description: idol.description
                    }
                });
            }
            console.log("✅ Baza danych została pomyślnie napełniona danymi Cloudinary!");
        } else {
            console.log("🟢 Baza danych jest gotowa.");
        }
    } catch (error) {
        console.error("❌ Błąd podczas automatycznego ładowania bazy:", error);
    }
}


app.get('/api/contestants', async (req, res) => {
    try {
        const idols = await prisma.idol.findMany();
        return res.json(idols);
    } catch (error) {
        console.error("Błąd podczas pobierania z bazy:", error);
        return res.status(500).json({ error: "Błąd połączenia z bazą danych!" });
    }
});
app.use(express.static(path.join(__dirname, 'dist')));
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

const PORT = 3000;
seedDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`🚀 Serwer działa na porcie ${PORT}`);
    });
});

app.post('/api/tournaments', async (req, res) => {
    try {
        const { playerName, scores } = req.body;

        const newTournament = await prisma.tournament.create({
            data: {
                playerName: playerName,
                scores: {
                    create: scores.map(score => ({
                        points: score.points,
                        idol: { connect: { id: score.idolId } }
                    }))
                }
            }
        });

        return res.status(201).json({ message: "Wynik zapisany!", tournament: newTournament });
    } catch (error) {
        console.error("Błąd podczas zapisywania turnieju:", error);
        return res.status(500).json({ error: "Nie udało się zapisać wyników." });
    }
});