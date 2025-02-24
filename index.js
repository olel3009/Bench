// index.js
require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');
const pgpLib = require('pg-promise');
const pgp = pgpLib();
const { PrismaClient } = require('@prisma/client');
const BookshelfLib = require('bookshelf');
const Knex = require('knex');
const { EntitySchema, MikroORM } = require('@mikro-orm/core');

// Globaler Counter (zur Generierung einzigartiger Werte)
let counter = 0;

// ----- DB-Verbindungen und Konfigurationen -----

// Native SQL (pg-promise)
const db = pgp(process.env.DATABASE_URL);

// Sequelize
const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Prisma
const prisma = new PrismaClient();

// Bookshelf.js (mit Knex)
const knexConfig = {
  client: 'pg',
  connection: process.env.DATABASE_URL,
  migrations: {
    tableName: 'knex_migrations'
  }
};
const knexInstance = Knex(knexConfig);
const Bookshelf = BookshelfLib(knexInstance);

// MikroORM Konfiguration und Entity-Definition
const UserEntity = new EntitySchema({
  name: 'User',
  tableName: 'users',
  columns: {
    id: { primary: true, type: 'number', autoincrement: true },
    name: { type: 'string' },
    email: { type: 'string', unique: true }
  }
});
const mikroOrmConfig = {
  entities: [UserEntity],
  dbName: 'orm_test', // Name deiner Datenbank
  type: 'postgresql',
  clientUrl: process.env.DATABASE_URL,
};
let mikroOrmInstance; // wird in initMikro() initialisiert

// Für Sequelize definieren wir ein User-Modell
const UserSequelize = sequelize.define('User', {
  name: { type: DataTypes.STRING },
  email: { type: DataTypes.STRING, unique: true },
}, { timestamps: false });

// Für Bookshelf definieren wir ein User-Modell
const BookshelfUser = Bookshelf.Model.extend({
  tableName: 'users',
  idAttribute: 'id'
});

// ----- Testfunktionen für Native SQL (pg-promise) -----

async function nativeCreate() {
  const email = `native_${Date.now()}_${counter++}@example.com`;
  await db.one(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    ['Native Create', email]
  );
}

async function nativeRead() {
  await db.one("SELECT * FROM users WHERE email = $1", ['native_read@example.com']);
}
async function setupNativeRead() {
  await db.one(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    ['Native Read', 'native_read@example.com']
  );
}
async function cleanupNativeRead() {
  await db.none("DELETE FROM users WHERE email = $1", ['native_read@example.com']);
}

async function nativeUpdate() {
  await db.none("UPDATE users SET name = $1 WHERE email = $2", ['Native Updated', 'native_update@example.com']);
}
async function setupNativeUpdate() {
  await db.one(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    ['Native Update', 'native_update@example.com']
  );
}
async function cleanupNativeUpdate() {
  await db.none("DELETE FROM users WHERE email = $1", ['native_update@example.com']);
}

async function nativeDelete() {
  const email = `native_delete_${Date.now()}_${counter++}@example.com`;
  await db.one(
    "INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id",
    ['Native Delete', email]
  );
  await db.none("DELETE FROM users WHERE email = $1", [email]);
}

// ----- Testfunktionen für Prisma -----

async function prismaCreate() {
  const email = `prisma_${Date.now()}_${counter++}@example.com`;
  await prisma.user.create({ data: { name: 'Prisma Create', email } });
}

async function prismaRead() {
  await prisma.user.findUnique({ where: { email: 'prisma_read@example.com' } });
}
async function setupPrismaRead() {
  await prisma.user.create({ data: { name: 'Prisma Read', email: 'prisma_read@example.com' } });
}
async function cleanupPrismaRead() {
  await prisma.user.delete({ where: { email: 'prisma_read@example.com' } });
}

async function prismaUpdate() {
  await prisma.user.update({
    where: { email: 'prisma_update@example.com' },
    data: { name: 'Prisma Updated' },
  });
}
async function setupPrismaUpdate() {
  await prisma.user.create({ data: { name: 'Prisma Update', email: 'prisma_update@example.com' } });
}
async function cleanupPrismaUpdate() {
  await prisma.user.delete({ where: { email: 'prisma_update@example.com' } });
}

async function prismaDelete() {
  const email = `prisma_delete_${Date.now()}_${counter++}@example.com`;
  await prisma.user.create({ data: { name: 'Prisma Delete', email } });
  await prisma.user.delete({ where: { email } });
}

// ----- Testfunktionen für Sequelize -----

async function sequelizeCreate() {
  const email = `sequelize_${Date.now()}_${counter++}@example.com`;
  await UserSequelize.create({ name: 'Sequelize Create', email });
}

async function sequelizeRead() {
  await UserSequelize.findOne({ where: { email: 'sequelize_read@example.com' } });
}
async function setupSequelizeRead() {
  await UserSequelize.create({ name: 'Sequelize Read', email: 'sequelize_read@example.com' });
}
async function cleanupSequelizeRead() {
  await UserSequelize.destroy({ where: { email: 'sequelize_read@example.com' } });
}

async function sequelizeUpdate() {
  await UserSequelize.update(
    { name: 'Sequelize Updated' },
    { where: { email: 'sequelize_update@example.com' } }
  );
}
async function setupSequelizeUpdate() {
  await UserSequelize.create({ name: 'Sequelize Update', email: 'sequelize_update@example.com' });
}
async function cleanupSequelizeUpdate() {
  await UserSequelize.destroy({ where: { email: 'sequelize_update@example.com' } });
}

async function sequelizeDelete() {
  const email = `sequelize_delete_${Date.now()}_${counter++}@example.com`;
  await UserSequelize.create({ name: 'Sequelize Delete', email });
  await UserSequelize.destroy({ where: { email } });
}

// ----- Testfunktionen für Bookshelf.js -----

async function bookshelfCreate() {
  const email = `bookshelf_${Date.now()}_${counter++}@example.com`;
  const user = new BookshelfUser({ name: 'Bookshelf Create', email });
  await user.save();
}

async function bookshelfRead() {
  await new BookshelfUser({ email: 'bookshelf_read@example.com' }).fetch();
}
async function setupBookshelfRead() {
  await new BookshelfUser({ name: 'Bookshelf Read', email: 'bookshelf_read@example.com' }).save();
}
async function cleanupBookshelfRead() {
  await new BookshelfUser({ email: 'bookshelf_read@example.com' }).destroy({ require: false });
}

async function bookshelfUpdate() {
  const user = await new BookshelfUser({ email: 'bookshelf_update@example.com' }).fetch({ require: false });
  if (user) {
    user.set('name', 'Bookshelf Updated');
    await user.save();
  }
}
async function setupBookshelfUpdate() {
  await new BookshelfUser({ name: 'Bookshelf Update', email: 'bookshelf_update@example.com' }).save();
}
async function cleanupBookshelfUpdate() {
  await new BookshelfUser({ email: 'bookshelf_update@example.com' }).destroy({ require: false });
}

async function bookshelfDelete() {
  const email = `bookshelf_delete_${Date.now()}_${counter++}@example.com`;
  await new BookshelfUser({ name: 'Bookshelf Delete', email }).save();
  const user = await new BookshelfUser({ email }).fetch({ require: false });
  if (user) {
    await user.destroy();
  }
}

// ----- Testfunktionen für MikroORM -----

async function initMikro() {
  mikroOrmInstance = await MikroORM.init(mikroOrmConfig);
}

async function mikroCreate() {
  const em = mikroOrmInstance.em.fork();
  const email = `mikro_${Date.now()}_${counter++}@example.com`;
  const user = em.create('User', { name: 'Mikro Create', email });
  await em.persistAndFlush(user);
}

async function mikroRead() {
  const em = mikroOrmInstance.em.fork();
  await em.findOne('User', { email: 'mikro_read@example.com' });
}
async function setupMikroRead() {
  const em = mikroOrmInstance.em.fork();
  const user = em.create('User', { name: 'Mikro Read', email: 'mikro_read@example.com' });
  await em.persistAndFlush(user);
}
async function cleanupMikroRead() {
  const em = mikroOrmInstance.em.fork();
  const user = await em.findOne('User', { email: 'mikro_read@example.com' });
  if (user) {
    await em.removeAndFlush(user);
  }
}

async function mikroUpdate() {
  const em = mikroOrmInstance.em.fork();
  const user = await em.findOne('User', { email: 'mikro_update@example.com' });
  if (user) {
    user.name = 'Mikro Updated';
    await em.persistAndFlush(user);
  }
}
async function setupMikroUpdate() {
  const em = mikroOrmInstance.em.fork();
  const user = em.create('User', { name: 'Mikro Update', email: 'mikro_update@example.com' });
  await em.persistAndFlush(user);
}
async function cleanupMikroUpdate() {
  const em = mikroOrmInstance.em.fork();
  const user = await em.findOne('User', { email: 'mikro_update@example.com' });
  if (user) {
    await em.removeAndFlush(user);
  }
}

async function mikroDelete() {
  const em = mikroOrmInstance.em.fork();
  const email = `mikro_delete_${Date.now()}_${counter++}@example.com`;
  const user = em.create('User', { name: 'Mikro Delete', email });
  await em.persistAndFlush(user);
  await em.removeAndFlush(user);
}

// ----- Wrapper zum kontinuierlichen Testen (10 Minuten pro Durchlauf, 3 Durchläufe) -----

async function runTest(testName, testOperation, setupOperation, cleanupOperation) {
  console.log(`\n=== Starte Test: ${testName} ===`);
  if (setupOperation) {
    console.log(`Setup für ${testName}...`);
    await setupOperation();
  }
  
  for (let run = 0; run < 3; run++) {
    console.log(`\n>> ${testName} – Durchlauf ${run + 1} startet jetzt...`);
    let count = 0;
    const startTime = Date.now();
    const endTime = startTime + 600 * 1000; // 600 Sekunden = 10 Minuten
    while (Date.now() < endTime) {
      try {
        await testOperation();
        count++;
      } catch (error) {
        console.error(`${testName} Fehler in Durchlauf ${run + 1}:`, error);
      }
    }
    const elapsed = (Date.now() - startTime) / 1000;
    console.log(`>> ${testName} – Durchlauf ${run + 1} abgeschlossen: ${(count / elapsed).toFixed(2)} ops/sec (${count} ops in ${elapsed.toFixed(2)} sec)`);
  }
  
  if (cleanupOperation) {
    console.log(`Cleanup für ${testName}...`);
    await cleanupOperation();
  }
}

// ----- Hauptfunktion: Alle Durchsatztests ausführen -----

async function runAllThroughputTests() {
  try {
    // Initialisierung der ORMs
    await sequelize.sync();
    await initMikro();

    // --- Native SQL ---
    await runTest("Native SQL Create", nativeCreate);
    await runTest("Native SQL Read", nativeRead, setupNativeRead, cleanupNativeRead);
    await runTest("Native SQL Update", nativeUpdate, setupNativeUpdate, cleanupNativeUpdate);
    await runTest("Native SQL Delete", nativeDelete);

    // --- Prisma ---
    await runTest("Prisma Create", prismaCreate);
    await runTest("Prisma Read", prismaRead, setupPrismaRead, cleanupPrismaRead);
    await runTest("Prisma Update", prismaUpdate, setupPrismaUpdate, cleanupPrismaUpdate);
    await runTest("Prisma Delete", prismaDelete);

    // --- Sequelize ---
    await runTest("Sequelize Create", sequelizeCreate);
    await runTest("Sequelize Read", sequelizeRead, setupSequelizeRead, cleanupSequelizeRead);
    await runTest("Sequelize Update", sequelizeUpdate, setupSequelizeUpdate, cleanupSequelizeUpdate);
    await runTest("Sequelize Delete", sequelizeDelete);

    // --- Bookshelf.js ---
    await runTest("Bookshelf Create", bookshelfCreate);
    await runTest("Bookshelf Read", bookshelfRead, setupBookshelfRead, cleanupBookshelfRead);
    await runTest("Bookshelf Update", bookshelfUpdate, setupBookshelfUpdate, cleanupBookshelfUpdate);
    await runTest("Bookshelf Delete", bookshelfDelete);

    // --- MikroORM ---
    await runTest("MikroORM Create", mikroCreate);
    await runTest("MikroORM Read", mikroRead, setupMikroRead, cleanupMikroRead);
    await runTest("MikroORM Update", mikroUpdate, setupMikroUpdate, cleanupMikroUpdate);
    await runTest("MikroORM Delete", mikroDelete);
  } catch (error) {
    console.error("Fehler während der Tests:", error);
  } finally {
    // Verbindungen schließen
    await prisma.$disconnect();
    await sequelize.close();
    knexInstance.destroy();
    pgp.end();
    if (mikroOrmInstance) await mikroOrmInstance.close(true);
    process.exit(0);
  }
}

runAllThroughputTests();
