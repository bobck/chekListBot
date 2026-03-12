import { sql } from 'kysely';

export async function up(db) {
  await sql`ALTER TABLE cars ADD COLUMN gps_device_id TEXT`.execute(db);
}

export async function down(db) {
  await sql`ALTER TABLE cars DROP COLUMN gps_device_id`.execute(db);
}
