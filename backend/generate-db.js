import fs from 'fs';
import path from 'path';

const DB_FILE = './baza.json';
const idolsDir = './idols';

console.log("Rozpoczynam skanowanie folderów i budowanie bazy...");

if (!fs.existsSync(idolsDir)) {
    console.error("Błąd: Brak folderu 'idols'! Skrypt musi być uruchomiony tam, gdzie są foldery ze zdjęciami.");
    process.exit(1);
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
                let descriptionText = "";
                let imagePath = null;

                files.forEach(file => {
                    if (file === 'opis.txt') {
                        descriptionText = fs.readFileSync(path.join(idolPath, file), 'utf-8');
                    } else if (file.match(/\.(jpg|jpeg|png|gif)$/i)) {
                        imagePath = `${group}/${idol}/${file}`;
                    } 
                });

                if (imagePath) {
                    contestants.push({
                        id: idCounter++,
                        group: group.toUpperCase(),
                        name: idol.charAt(0).toUpperCase() + idol.slice(1),
                        images: [imagePath],     
                        description: descriptionText.trim() || null
                    });
                }
            }
        });
    }
});

fs.writeFileSync(DB_FILE, JSON.stringify(contestants, null, 4), 'utf-8');
console.log(`Sukces! Zapisano ${contestants.length} idolek do pliku baza.json.`);