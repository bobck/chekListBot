import XLSX from 'xlsx';
import path from 'path';
import pg from 'pg';

const { Client } = pg;

async function joinDevicesWithCars() {
  // 1. Read gps_devices.xlsx
  const workbook = XLSX.readFile(path.resolve('gps_devices.xlsx'));
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const devices = XLSX.utils.sheet_to_json(sheet);

  if (!devices.length) {
    console.log('No devices in xlsx.');
    return;
  }

  // 2. Extract id and name from xlsx
  const deviceMap = new Map();
  for (const row of devices) {
    if (row.id != null && row.name) {
      deviceMap.set(row.name.toString().trim(), row.id);
    }
  }

  const plateNumbers = [...deviceMap.keys()];

  // 3. Connect to PostgreSQL and query cars
  const client = new Client({
    host: process.env.PG_HOST,
    port: Number(process.env.PG_PORT),
    database: process.env.PG_DB,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
  });

  await client.connect();

  const placeholders = plateNumbers.map((_, i) => `$${i + 1}`).join(', ');
  const { rows: cars } = await client.query(
    `SELECT vin, license_plate FROM cars WHERE license_plate IN (${placeholders})`,
    plateNumbers
  );

  await client.end();

  // 4. Join and build result
  const results = cars.map((car) => ({
    vin: car.vin,
    license_plate: car.license_plate,
    gps_device_id: deviceMap.get(car.license_plate) ?? null,
  }));

  // 5. Export to xlsx
  const headers = ['vin', 'license_plate', 'gps_device_id'];
  const rows = results.map((r) => headers.map((h) => r[h]));
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, worksheet, 'Joined');

  const outputPath = path.resolve('gps_cars_joined.xlsx');
  XLSX.writeFile(wb, outputPath);

  console.log(`Matched ${results.length} of ${plateNumbers.length} devices`);
  console.log(`Exported to ${outputPath}`);
}

joinDevicesWithCars().catch((err) => {
  console.error('Failed:', err);
  process.exit(1);
});
