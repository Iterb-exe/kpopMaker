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
        const idolCount = await prisma.idol.count();
        if (idolCount === 0 && fs.existsSync('./baza.json')) {
            console.log("Baza jest pusta. Ładuję dane z baza.json...");
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
            console.log("✅ Baza została napełniona!");
        }
        const tournamentCount = await prisma.tournament.count();
        if (tournamentCount === 0 && fs.existsSync('./wyniki.json')) {
            console.log("Baza turniejów jest pusta. Importuję historyczne wyniki z wyniki.json...");
            const allIdols = await prisma.idol.findMany();
            const idolMap = {};
            allIdols.forEach(idol => idolMap[idol.name.toLowerCase()] = idol.id);

            const rawWyniki = fs.readFileSync('./wyniki.json', 'utf-8');
            const wynikiData = JSON.parse(rawWyniki);

            for (const turniej of wynikiData) {
                const scorePayload = turniej.scores.map(s => {
                    const mappedId = idolMap[s.idolName.toLowerCase()];
                    if (mappedId) {
                        return { points: s.points, idol: { connect: { id: mappedId } } };
                    }
                }).filter(Boolean);

                if (scorePayload.length > 0) {
                    await prisma.tournament.create({
                        data: {
                            playerName: turniej.playerName,
                            status: 'APPROVED', 
                            scores: { create: scorePayload }
                        }
                    });
                }
            }
            console.log("✅ Historyczne wyniki turniejów załadowane pomyślnie!");
        } else if (idolCount > 0 && tournamentCount > 0) {
            console.log("🟢 Baza danych jest kompletna i gotowa.");
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
app.get('/api/tournaments', async (req, res) => {
    try {
        const tournaments = await prisma.tournament.findMany({
            where: {
                status: 'PENDING'
            }
        });
        return res.json(tournaments);
    } catch (error) {
        console.error("Błąd podczas pobierania turniejów:", error);
        return res.status(500).json({ error: "Błąd serwera podczas pobierania turniejów." });
    }
});
app.get('/api/ranking', async (req, res) => {
    try {
        const idols = await prisma.idol.findMany({
            include: {
                scores: {
                    where: {
                        tournament: {
                            status: 'APPROVED'
                        }
                    }
                }
            }
        });
        const ranking = idols.map(idol => {
            const totalPoints = idol.scores.reduce((sum, score) => sum + score.points, 0);
            return {
                id: idol.id,
                name: idol.name,
                group: idol.group,
                totalPoints: totalPoints
            };
        });
        ranking.sort((a, b) => b.totalPoints - a.totalPoints);
        
        return res.json(ranking);
        
    } catch (error) {
        console.error("Błąd podczas generowania rankingu:", error);
        return res.status(500).json({ error: "Błąd serwera podczas pobierania rankingu." });
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