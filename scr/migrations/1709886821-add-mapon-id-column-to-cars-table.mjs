import { sql } from 'kysely'

export async function up(db) {
    await sql`ALTER TABLE cars ADD COLUMN mapon_id TEXT`.execute(db)
}

export async function down(db) {
    await sql`ALTER TABLE cars DROP COLUMN mapon_id`.execute(db)

}