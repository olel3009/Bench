require('dotenv').config();
const { Sequelize } = require('sequelize');
const pgp = require('pg-promise')();
const { PrismaClient } = require('@prisma/client');
const Knex = require('knex');

// PostgreSQL Verbindung (pg-promise)
const db = pgp(process.env.DATABASE_URL);

// Sequelize Konfiguration
const sequelize = new Sequelize(process.env.DATABASE_URL, { dialect: 'postgres' });

// Prisma Client
const prisma = new PrismaClient();

// Knex Konfiguration
const knex = Knex({
  client: 'pg',
  connection: process.env.DATABASE_URL
});

async function testConnections() {
  try {
    console.log("🔄 Verbindung wird getestet...");

    // PostgreSQL native
    await db.one("SELECT 1 AS result");
    console.log("✅ pg-promise Verbindung erfolgreich!");

    // Sequelize
    await sequelize.authenticate();
    console.log("✅ Sequelize Verbindung erfolgreich!");

    // Prisma
    await prisma.$connect();
    console.log("✅ Prisma Verbindung erfolgreich!");

    // Knex
    const result = await knex.raw("SELECT 1 AS result");
    console.log("✅ Knex Verbindung erfolgreich!");

    console.log("🎉 Alle Verbindungen sind aktiv!");
  } catch (error) {
    console.error("❌ Fehler bei der Verbindung:", error);
  } finally {
    await prisma.$disconnect();
    await sequelize.close();
    knex.destroy();
    pgp.end();
  }
}

testConnections();
