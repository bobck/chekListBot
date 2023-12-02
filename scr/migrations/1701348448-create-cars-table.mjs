export async function up(db) {
    await db.schema
        .createTable('cars')
        .addColumn('id', 'integer', (col) => col.primaryKey())
        .addColumn('car_num', 'text', (col) => col.notNull())
        .execute()
}

export async function down(db) {
    await db.schema.dropTable('cars').execute()
}