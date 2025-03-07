// server.js

const express = require('express');
const bodyParser = require('body-parser');
const { PrismaClient } = require('@prisma/client');

const app = express();
app.use(bodyParser.json());

const prisma = new PrismaClient();

// Hinweis: Für Prisma erfolgt die DB-Erstellung (Migration) normalerweise extern.
// Hier geben wir lediglich eine Rückmeldung.
app.post('/api/prisma/db/create', async (req, res) => {
    try {
        res.status(200).json({ message: 'Prisma: DB-Erstellung (Migration) extern durchführen.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// "Drop": Hier löschen wir alle Datensätze der Tabelle als "Drop"-Simulation.
app.delete('/api/prisma/db/drop', async (req, res) => {
    try {
        await prisma.resource.deleteMany();
        res.status(200).json({ message: 'Prisma: Resource-Tabelle geleert.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create-Operation: Erstelle einen neuen Resource-Eintrag
app.post('/api/prisma/resource', async (req, res) => {
    try {
        const resource = await prisma.resource.create({
            data: { name: req.body.name },
        });
        res.status(201).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read-Operation: Lese einen Resource-Eintrag anhand der ID
app.get('/api/prisma/resource/:id', async (req, res) => {
    try {
        const resource = await prisma.resource.findUnique({
            where: { id: Number(req.params.id) },
        });
        if (!resource) return res.status(404).json({ error: 'Nicht gefunden' });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update-Operation: Aktualisiere einen Resource-Eintrag anhand der ID
app.put('/api/prisma/resource/:id', async (req, res) => {
    try {
        const resource = await prisma.resource.update({
            where: { id: Number(req.params.id) },
            data: { name: req.body.name },
        });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete-Operation: Lösche einen Resource-Eintrag anhand der ID
app.delete('/api/prisma/resource/:id', async (req, res) => {
    try {
        await prisma.resource.delete({
            where: { id: Number(req.params.id) },
        });
        res.status(200).json({ message: 'Gelöscht.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
