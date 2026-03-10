import { db } from '../../database.mjs';
import { fetchGpsDevices } from '../gps.utils.mjs';

let isRefreshing = false;

export async function refreshGpsDevices() {
  if (isRefreshing) {
    console.log('refreshGpsDevices is already running, skipping...');
    return;
  }
  isRefreshing = true;

  try {
    const devices = await fetchGpsDevices();

    const values = devices.map((device) => ({
      id: device.id,
      name: device.name,
    }));

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('gps_devices').execute();
      await trx.insertInto('gps_devices').values(values).execute();
    });

    return values.length;
  } finally {
    isRefreshing = false;
  }
}

if (process.env.ENV == 'dev') {
  refreshGpsDevices();
}
