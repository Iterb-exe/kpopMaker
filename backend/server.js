import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';

const app = express();
app.use(cors());
app.use('/images', express.static('idols'));

app.get('/api/contestants', (req, res) => {
    const idolsDir = './idols';
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
                        }
                        else {
                            imagesList.push(`${group}/${idol}/${file}`);
                        } 
                        
                    });
                    if (imagesList.length > 0) {
                        contestants.push({
                            id: idCounter++,
                            group: group.toUpperCase(),
                            name: idol.charAt(0).toUpperCase() + idol.slice(1),
                            images: imagesList,     
                            description: descriptionText.trim() 
                        });
                    }
                    else{
                        contestants.push({
                            id: idCounter++,
                            group: group.toUpperCase(),
                            name: idol.charAt(0).toUpperCase() + idol.slice(1),
                            images: null,
                            description: null
                        });
                    }
                }
            });
        }
    });

    res.json(contestants);
});

app.listen(3000, () => {
    console.log('Serwer działa! Sprawdź: http://localhost:3000/api/contestants');
});