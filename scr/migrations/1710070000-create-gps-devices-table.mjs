export async function up(db) {
  await db.schema
    .createTable('gps_devices')
    .addColumn('id', 'integer', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .execute();
}

export async function down(db) {
  await db.schema.dropTable('gps_devices').execute();
}
