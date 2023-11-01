import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const petsFilePath = path.join(__dirname, '..', 'pets.json');

const app = express();
const port = 3000;

app.use(express.json());

app.get("/pets", (req, res, next) => {
    fs.readFile(petsFilePath, 'utf8', (err, data) => {
        if (err) {
            return next(err); 
        }
        res.send(JSON.parse(data));
    });
});

app.get("/pets/:index", (req, res, next) => {
    const index = parseInt(req.params.index, 10);
    fs.readFile(petsFilePath, 'utf8', (err, data) => {
        if (err) {
            return next(err);
        }
        const pets = JSON.parse(data);
        if (index < 0 || index >= pets.length) {
            return res.status(404).send('Not Found');
        }
        res.send(pets[index]);
    });
});

app.post("/pets", (req, res, next) => {
    const newPet = req.body;
    if (!newPet.name || typeof newPet.age !== 'number' || !newPet.kind) {
        return res.status(400).send('Bad Request');
    }
    fs.readFile(petsFilePath, 'utf-8', (err, data) => {
        if (err) {
            return next(err);
        }
        const pets = JSON.parse(data);
        pets.push(newPet);
        fs.writeFile(petsFilePath, JSON.stringify(pets, null, 2), err => {
            if (err) {
                return next(err);
            }
            res.status(201).send(newPet);
        });
    });
});

app.use((req, res, next) => {
    res.status(404).send('Not Found');
});


app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Internal Server Error');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
