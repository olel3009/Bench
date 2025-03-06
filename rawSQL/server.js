const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
app.use(bodyParser.json());

// PostgreSQL-Datenbankverbindung einrichten
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'postgres',
    password: 'postgres',
    port: 5432,
});

// Erstelle die Datenbank-Tabelle mit Raw SQL
app.post('/api/rawsql/db/create', async (req, res) => {
    try {
        await pool.query(`DROP TABLE IF EXISTS "Resource";`);
        await pool.query(`
            CREATE TABLE "Resource" (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL
            );
        `);
        res.status(200).json({ message: 'Raw SQL: Tabelle erstellt.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lösche die gesamte Datenbank-Tabelle
app.delete('/api/rawsql/db/drop', async (req, res) => {
    try {
        await pool.query(`DROP TABLE IF EXISTS "Resource";`);
        res.status(200).json({ message: 'Raw SQL: Tabelle gelöscht.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create-Operation: Neuen Eintrag hinzufügen
app.post('/api/rawsql/resource', async (req, res) => {
    try {
        const result = await pool.query(
            `INSERT INTO "Resource" (name) VALUES ($1) RETURNING id, name;`,
            [req.body.name]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read-Operation: Eintrag anhand der ID abrufen
app.get('/api/rawsql/resource/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM "Resource" WHERE id = $1;`,
            [req.params.id]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'Nicht gefunden' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update-Operation: Eintrag anhand der ID aktualisieren
app.put('/api/rawsql/resource/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `UPDATE "Resource" SET name = $1 WHERE id = $2 RETURNING id, name;`,
            [req.body.name, req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Nicht gefunden' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete-Operation: Eintrag anhand der ID löschen
app.delete('/api/rawsql/resource/:id', async (req, res) => {
    try {
        const result = await pool.query(
            `DELETE FROM "Resource" WHERE id = $1 RETURNING id;`,
            [req.params.id]
        );
        if (result.rowCount === 0) return res.status(404).json({ error: 'Nicht gefunden' });
        res.status(200).json({ message: 'Gelöscht.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Starte den Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
