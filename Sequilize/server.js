const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');

const app = express();
app.use(bodyParser.json());

// Verbindung zur PostgreSQL-Datenbank
const sequelize = new Sequelize('postgres://postgres:postgres@localhost:5432/postgres');

// Definiere das Model "Resource"
const SequelizeResource = sequelize.define('Resource', {
    name: { type: DataTypes.STRING, allowNull: false },
}, { timestamps: false });

// Erstelle die Datenbank (Tabellen)
app.post('/api/sequelize/db/create', async (req, res) => {
    try {
        await sequelize.sync({ force: true });
        res.status(200).json({ message: 'Sequelize: Datenbank (Tabellen) erstellt.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lösche die Datenbank (Tabellen)
app.delete('/api/sequelize/db/drop', async (req, res) => {
    try {
        await sequelize.drop();
        res.status(200).json({ message: 'Sequelize: Datenbank (Tabellen) gelöscht.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create-Operation: Erstelle einen neuen Resource-Eintrag
app.post('/api/sequelize/resource', async (req, res) => {
    try {
        const resource = await SequelizeResource.create({ name: req.body.name });
        res.status(201).json({ id: resource.id, name: resource.name });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read-Operation: Lese einen Resource-Eintrag anhand der ID
app.get('/api/sequelize/resource/:id', async (req, res) => {
    try {
        const resource = await SequelizeResource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ error: 'Nicht gefunden' });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update-Operation: Aktualisiere einen Resource-Eintrag anhand der ID
app.put('/api/sequelize/resource/:id', async (req, res) => {
    try {
        const resource = await SequelizeResource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ error: 'Nicht gefunden' });
        resource.name = req.body.name;
        await resource.save();
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete-Operation: Lösche einen Resource-Eintrag anhand der ID
app.delete('/api/sequelize/resource/:id', async (req, res) => {
    try {
        const resource = await SequelizeResource.findByPk(req.params.id);
        if (!resource) return res.status(404).json({ error: 'Nicht gefunden' });
        await resource.destroy();
        res.status(200).json({ message: 'Gelöscht.' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Starte den Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
