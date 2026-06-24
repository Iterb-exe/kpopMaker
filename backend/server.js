import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const prisma = new PrismaClient();

const ERROR_CODES = Object.freeze({
  AUTH_FAILED: 'AUTH_FAILED',
  INVALID_DATA: 'INVALID_DATA',
  DB_ERROR: 'DB_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  NOT_FOUND: 'NOT_FOUND'
});

const sendError = (res, statusCode, errorCode, details = null) => {
  const payload = { errorCode };
  if (details !== null) payload.details = details;
  return res.status(statusCode).json(payload);
};

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

const requireAdmin = async (req, res, next) => {
    try {
        const clientPassword = req.headers['x-admin-password'];
        const hash = process.env.ADMIN_PASSWORD_HASH;
        if (!clientPassword || !hash) {
            return sendError(res, 401, ERROR_CODES.AUTH_FAILED);
        }
        const isValid = await bcrypt.compare(clientPassword, hash);

        if (isValid) {
            next();
        } else {
            return sendError(res, 401, ERROR_CODES.AUTH_FAILED);
        }
    } catch (error) {
        console.error("Błąd podczas autoryzacji:", error);
        return sendError(res, 500, ERROR_CODES.SERVER_ERROR);
    }
};
const tournamentSchema = z.object({
    playerName: z.string().min(1, "Imię gracza nie może być puste").max(50, "Imię gracza jest za długie"),
    scores: z.array(
        z.object({
            idolId: z.number().int().positive("ID idolki musi być dodatnią liczbą całkowitą"),
            points: z.number().int().min(0, "Punkty nie mogą być ujemne")
        })
    ).min(1, "Turniej musi zawierać co najmniej jeden wynik")
});
app.get('/api/contestants', async (req, res) => {
    try {
        const idols = await prisma.idol.findMany();
        return res.json(idols);
    } catch (error) {
        console.error("Błąd podczas pobierania z bazy:", error);
        return sendError(res, 500, ERROR_CODES.DB_ERROR);
    }
});

app.post('/api/tournaments', async (req, res) => {
    try {
        const validatedData = tournamentSchema.parse(req.body);
        const newTournament = await prisma.tournament.create({
            data: {
                playerName: validatedData.playerName,
                scores: {
                    create: validatedData.scores.map(score => ({
                        points: score.points,
                        idol: { connect: { id: score.idolId } }
                    }))
                }
            }
        });

        return res.status(201).json({ message: "Wynik zapisany!", tournament: newTournament });

    } catch (error) {
        if (error instanceof z.ZodError) {
            console.warn("Odrzucono niepoprawne dane:", error.errors);
            return sendError(res, 400, ERROR_CODES.INVALID_DATA, error.errors);
        }
        console.error("Błąd podczas zapisywania turnieju:", error);
        return sendError(res, 500, ERROR_CODES.SERVER_ERROR);
    }
});
app.get('/api/tournaments', requireAdmin, async (req, res) => {
    try {
        const tournaments = await prisma.tournament.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                scores: {
                    orderBy: { points: 'desc' },
                    include: { idol: true }
                }
            }
        });
        return res.json(tournaments);
    } catch (error) {
        console.error("Błąd podczas pobierania turniejów:", error);
        return sendError(res, 500, ERROR_CODES.DB_ERROR);
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
        return sendError(res, 500, ERROR_CODES.DB_ERROR);
    }
});

app.put('/api/tournaments/:id/approve', requireAdmin, async (req, res) => {
    try {
        const tournamentId = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(tournamentId)) {
            return sendError(res, 400, ERROR_CODES.INVALID_DATA, { field: 'id' });
        }

        const updatedTournament = await prisma.tournament.update({
            where: { id: tournamentId },
            data: { status: 'APPROVED' }
        });

        return res.json({ message: "Turniej zatwierdzony!", tournament: updatedTournament });
    } catch (error) {
        console.error("Błąd podczas akceptacji turnieju:", error);
        return sendError(res, 500, ERROR_CODES.DB_ERROR);
    }
});

app.delete('/api/tournaments/:id', requireAdmin, async (req, res) => {
    try {
        const tournamentId = Number.parseInt(req.params.id, 10);
        if (!Number.isInteger(tournamentId)) {
            return sendError(res, 400, ERROR_CODES.INVALID_DATA, { field: 'id' });
        }

        await prisma.score.deleteMany({
            where: { tournamentId: tournamentId }
        });
        await prisma.tournament.delete({
            where: { id: tournamentId }
        });

        return res.json({ message: "Turniej i jego wyniki zostały trwale usunięte." });
    } catch (error) {
        console.error("Błąd podczas usuwania turnieju:", error);
        return sendError(res, 500, ERROR_CODES.DB_ERROR);
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