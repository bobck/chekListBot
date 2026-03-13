import { fetchGpsDevices } from './gps.utils.mjs';
import XLSX from 'xlsx';
import path from 'path';

async function exportDevicesToXlsx() {
  const devices = await fetchGpsDevices();

  if (!devices.length) {
    console.log('No devices found.');
    return;
  }
  console.log(devices)
  // Use all keys from the first device as column headers
  const headers = Object.keys(devices[0]);

  const rows = devices.map((device) =>
    headers.map((h) => {
      const val = device[h];
      // Flatten objects/arrays to JSON string for readability
      return val !== null && typeof val === 'object' ? JSON.stringify(val) : val;
    })
  );

  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Devices');

  const outputPath = path.resolve('gps_devices.xlsx');
  XLSX.writeFile(workbook, outputPath);
  console.log(`Exported ${devices.length} devices to ${outputPath}`);
}

exportDevicesToXlsx().catch((err) => {
  console.error('Export failed:', err);
  process.exit(1);
});
