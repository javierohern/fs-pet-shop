import express from 'express';
import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'petsdb',
    password: '2623',
    port: 5432,
  });

const app = express();
const port = 3000;
app.use(express.json());

app.get("/pets", async (req, res, next) => {
    try {
        let result = await pool.query('SELECT * FROM pets');
        res.send(result.rows);
    } catch (err) {
        next(err);
    }
})

app.get("/pets/:index", async (req, res, next) => {
    const id = parseInt(req.params.index, 10);
    if (isNaN(id)) {
        return res.status(400).send('Invalid ID');
    }
    try {
        const result = await pool.query('SELECT * FROM pets WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).send('Not Found');
        }

        res.send(result.rows[0]);

    } catch (err) {
        next(err);
    }
});

app.post("/pets", async (req, res, next) => {
    const { name, age, kind } = req.body;
    if (!name || !typeof age === 'number' || !kind) {
        return res.status(400).send('Bad Request');
    }
    try {
        const result = await pool.query('INSERT INTO pets (name, age, kind) VALUES ($1, $2, $3) RETURNING *', [name, age, kind]);
        res.status(201).send(result.rows[0]);
    } catch (err) {
        next(err)
    }
});

app.patch("/pets/:id", async (req, res, next) => {
    const id = parseInt(req.params.id);
    const { name, age, kind } = req.body;
    if (typeof age !== 'number' || !name || !kind) {
        return res.status(400).send('Bad Request');
    }

    try {
        const result = await pool.query(
            'UPDATE pets SET name = $1, age = $2, kind = $3 WHERE id = $4 RETURNING *',
            [name, age, kind, id]
        );
        if (result.rows.length === 0) {
            return res.status(400).send('Not Found');
        }
        res.send(result.rows[0]);
    } catch (err) {
        next(err);
    }
});


app.delete("/pets/:id", async (req, res, next) => {
    const id = parseInt(req.params.id, 10);

    try {
        const result = await pool.query('DELETE FROM pets WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).send('Not Found');
        }

        res.send(result.rows[0]);
    } catch (err) {
        next(err);
    }
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


// TO delete -> curl -X DELETE http://localhost:3000/pets/{ID}
// To GET -> curl http://localhost:3000/pets
// To Post -> curl -X POST -H "Content-Type: application/json" -d '{"name":"Purrsloud","age":6,"kind":"cat"}' http://localhost:3000/pets
// To Patch -> curl -X PATCH -H "Content-Type: application/json" -d '{"name":"Purrsloud","age":6,"kind":"cat"}' http://localhost:3000/pets/1
