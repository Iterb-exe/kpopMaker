import express from 'express';
import cors from 'cors';
import fs from 'fs';

const app = express();
app.use(cors());

const DB_FILE = './baza.json';

app.get('/api/contestants', (req, res) => {
    if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return res.json(JSON.parse(data));
    } else {
        return res.status(500).json({ 
            error: "Brak pliku baza.json! Uruchom najpierw skrypt generate-db.js na komputerze z folderami, a potem przerzuć plik." 
        });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 Serwer API działa! Sprawdź: http://localhost:${PORT}/api/contestants`);
});