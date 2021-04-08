const { sqlitePath } = require('./dist/main/config')

module.exports = {
    type: "sqlite",
    database: sqlitePath,
    synchronize: true,
    migrations: ["./dist/main/db/migrations/*.js"],
    entities: ["./dist/main/db/entities/*.js"],
    cli: {
        migrationsDir: "./src/main/db/migrations"
    }
}