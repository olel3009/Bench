const express = require("express");
const bodyParser = require("body-parser");
const knex = require("knex");
const bookshelf = require("bookshelf");

const app = express();
app.use(bodyParser.json());

// PostgreSQL-Verbindung über Knex.js
const db = knex({
    client: "pg",
    connection: {
        host: "localhost",
        user: "postgres",
        password: "postgres",
        database: "postgres",
    },
});

// Bookshelf ORM mit Knex verbinden
const orm = bookshelf(db);

// Definiere das Model "Resource"
const Resource = orm.model("Resource", {
    tableName: "resources",
});

// Erstelle die Datenbank (Tabelle)
app.post("/api/bookshelf/db/create", async (req, res) => {
    try {
        await db.schema.dropTableIfExists("resources");
        await db.schema.createTable("resources", (table) => {
            table.increments("id").primary();
            table.string("name").notNullable();
        });
        res.status(200).json({ message: "Bookshelf: Datenbank (Tabelle) erstellt." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Lösche die gesamte Datenbank-Tabelle
app.delete("/api/bookshelf/db/drop", async (req, res) => {
    try {
        await db.schema.dropTableIfExists("resources");
        res.status(200).json({ message: "Bookshelf: Datenbank (Tabelle) gelöscht." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create-Operation: Neuen Eintrag hinzufügen
app.post("/api/bookshelf/resource", async (req, res) => {
    try {
        const resource = await new Resource({ name: req.body.name }).save();
        res.status(201).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read-Operation: Eintrag anhand der ID abrufen
app.get("/api/bookshelf/resource/:id", async (req, res) => {
    try {
        const resource = await new Resource({ id: req.params.id }).fetch();
        if (!resource) return res.status(404).json({ error: "Nicht gefunden" });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update-Operation: Eintrag anhand der ID aktualisieren
app.put("/api/bookshelf/resource/:id", async (req, res) => {
    try {
        const resource = await new Resource({ id: req.params.id }).fetch();
        if (!resource) return res.status(404).json({ error: "Nicht gefunden" });
        await resource.save({ name: req.body.name });
        res.status(200).json(resource);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete-Operation: Eintrag anhand der ID löschen
app.delete("/api/bookshelf/resource/:id", async (req, res) => {
    try {
        const resource = await new Resource({ id: req.params.id }).fetch();
        if (!resource) return res.status(404).json({ error: "Nicht gefunden" });
        await resource.destroy();
        res.status(200).json({ message: "Gelöscht." });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Starte den Server
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`🚀 Server läuft auf Port ${PORT}`);
});
