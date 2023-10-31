import { fileURLToPath } from 'url';
import fs from 'fs';
import path from 'path';
import http from 'http';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const petsPath = path.join(__dirname, '..', 'pets.json');
const petRegExp = /^\/pets\/(.*)$/;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/pets') {
        fs.readFile(petsPath, 'utf8', (err, data) => {
            if (err) {
                res.statusCode = 500;
                res.end('Internal Server Error');
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(data);
        });
    } else if (req.method === 'GET' && petRegExp.test(req.url)) {
        const index = parseInt(req.url.split('/')[2]);
        fs.readFile(petsPath, 'utf8', (err, data) => {
            const pets = JSON.parse(data);
            if (!pets[index]) {
                res.statusCode = 404;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Not Found');
                return;
            }
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(pets[index]));
        });
    } else if (req.method === 'GET') {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not Found');
    } else if (req.method === 'POST' && req.url === '/pets') {
        let body = '';
        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            const pet = JSON.parse(body);
            if (!pet.name || typeof pet.age !== 'number' || !pet.kind) {
                res.statusCode = 400;
                res.setHeader('Content-Type', 'text/plain');
                res.end('Bad Request');
                return;
            }
            fs.readFile(petsPath, 'utf8', (err, data) => {
                const pets = JSON.parse(data);
                pets.push(pet);
                fs.writeFile(petsPath, JSON.stringify(pets, null, 2), err => {
                    if (err) {
                        res.statusCode = 500;
                        res.end('Internal Server Error');
                        return;
                    }
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify(pet));
                });
            });
        });
    } else {
        res.statusCode = 404;
        res.setHeader('Content-Type', 'text/plain');
        res.end('Not Found');
    }
});

const port = 3000;
server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
})
