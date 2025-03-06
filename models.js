const { Sequelize, DataTypes } = require("sequelize");

const sequelize = new Sequelize("testdb", "user", "password", {
    host: "localhost",
    dialect: "postgres",
});

const User = sequelize.define("User", {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
});

async function setupDatabase() {
    await sequelize.sync({ force: true });
    console.log("Datenbank synchronisiert");
}

module.exports = { sequelize, User, setupDatabase };
