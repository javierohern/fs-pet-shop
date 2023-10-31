#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FILE_PATH = path.join(__dirname, '..', 'pets.json');


function readJson(filePath) {
    const data = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(data);
}

function writeJson(filePath, data) {
    fs.writeFileSync(filePath, JSON.stringify(data));
}

const args = process.argv.slice(2);

if (!args.length || !['read', 'create', 'update', 'destroy'].includes(args[0])) {
    console.error('Usage: node fs.js [read | create | update | destroy]');
    process.exit(1);
}

if (args[0] === 'read') {
    const pets = readJson(FILE_PATH);

    if (args[1]) {
        const index = parseInt(args[1]);

        if (index >= 0 && index < pets.length) {
            console.log(pets[index]);
        } else {
            console.error('Usage: node fs.js read INDEX');
            process.exit(1);
        }
    } else {
        console.log(pets);
    }
}

if (args[0] === 'create') {
    if (!args[1] || !args[2] || !args[3]) {
        console.error('Usage: node fs.js create AGE KIND NAME');
        process.exit(1);
    }

    const pet = {
        age: parseInt(args[1]),
        kind: args[2],
        name: args[3]
    };

    const pets = readJson(FILE_PATH);
    pets.push(pet);

    writeJson(FILE_PATH, pets);
    console.log(pet);
}

if (args[0] === 'update') {
    if (args.length !== 5) {
        console.error('Usage: node fs.js update INDEX AGE KIND NAME');
        process.exit(1);
    }

    const index = parseInt(args[1]);
    const pets = readJson(FILE_PATH);

    if (index >= 0 && index < pets.length) {
        const updatedPet = {
            age: parseInt(args[2]),
            kind: args[3],
            name: args[4]
        };

        pets[index] = updatedPet;
        writeJson(FILE_PATH, pets);
        console.log(updatedPet);
    } else {
        console.error('Error: Index out of bounds');
        process.exit(1);
    }
}

if (args[0] === 'destroy') {
    if (args.length !== 2) {
        console.error('Usage: node fs.js destroy INDEX');
        process.exit(1);
    }

    const index = parseInt(args[1]);
    const pets = readJson(FILE_PATH);

    if (index >= 0 && index < pets.length) {
        const removedPet = pets.splice(index, 1)[0];
        writeJson(FILE_PATH, pets);
        console.log(removedPet);
    } else {
        console.error('Error: Index out of bounds');
        process.exit(1);
    }
}
