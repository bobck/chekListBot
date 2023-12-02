import { promises as fs } from 'fs'
import path from 'path'
import { Migrator, FileMigrationProvider } from 'kysely'
import { db } from './scr/database.mjs'

const migrator = new Migrator({
    db,
    provider: new FileMigrationProvider({
        fs,
        path,
        migrationFolder: path.join(process.cwd(), 'scr/migrations')
    })
})

if (process.env.ENV == 'up') {
    const { error, results } = await migrator.migrateUp();
    console.log({ error, results })
}

if (process.env.ENV == 'down') {
    migrator.migrateDown();
}