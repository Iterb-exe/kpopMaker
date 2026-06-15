import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
const DB_FILE = './baza.json';

app.get('/api/contestants', (req, res) => {
    if (fs.existsSync(DB_FILE)) {
        const data = fs.readFileSync(DB_FILE, 'utf-8');
        return res.json(JSON.parse(data));
    }
    const idolsDir = './idols';
    if (!fs.existsSync(idolsDir)) {
        return res.status(500).json({ error: "Brak folderu idols i brak pliku baza.json!" });
    }

    const contestants = [];
    let idCounter = 1;
    const groups = fs.readdirSync(idolsDir);

    groups.forEach(group => {
        const groupPath = path.join(idolsDir, group);
        
        if (fs.statSync(groupPath).isDirectory()) {
            const idols = fs.readdirSync(groupPath);
            
            idols.forEach(idol => {
                const idolPath = path.join(groupPath, idol);
                
                if (fs.statSync(idolPath).isDirectory()) {
                    const files = fs.readdirSync(idolPath);
                    const imagesList = [];
                    let descriptionText = "";

                    files.forEach(file => {
                        if (file === 'opis.txt') {
                            const descPath = path.join(idolPath, file);
                            descriptionText = fs.readFileSync(descPath, 'utf-8');
                        } else {
                            imagesList.push(`${group}/${idol}/${file}`);
                        } 
                    });

                    contestants.push({
                        id: idCounter++,
                        group: group.toUpperCase(),
                        name: idol.charAt(0).toUpperCase() + idol.slice(1),
                        images: imagesList.length > 0 ? imagesList : null,     
                        description: descriptionText.trim() || null
                    });
                }
            });
        }
    });
    fs.writeFileSync(DB_FILE, JSON.stringify(contestants, null, 4), 'utf-8');
    console.log("Sukces! Wygenerowano nowy plik baza.json ze struktur folderów.");

    res.json(contestants);
});

app.listen(3000, () => {
    console.log('Serwer działa! Sprawdź: http://localhost:3000/api/contestants');
});