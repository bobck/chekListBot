import { db } from '../../database.mjs';
import { listCars, transliterate } from '../bitrix.utils.mjs';

let isRefreshing = false;

export async function refreshCarlist() {
  if (isRefreshing) {
    console.log('refreshCarlist is already running, skipping...');
    return;
  }
  isRefreshing = true;

  try {
    const result = await listCars();
    const values = result.map((car) => {
      const { id, ufCrm4_1654801473656, ufCrm4_1654801619341, ufCrm4_1773310945 } = car;
      return {
        id,
        car_num: transliterate(ufCrm4_1654801473656).replace(/\s/g, ''),
        mapon_id: ufCrm4_1654801619341?.toString(),
        gps_device_id: ufCrm4_1773310945?.toString(),
      };
    });

    await db.transaction().execute(async (trx) => {
      await trx.deleteFrom('cars').execute();
      await trx.insertInto('cars').values(values).execute();
    });

    return values.length;
  } finally {
    isRefreshing = false;
  }
}

if (process.env.ENV == 'dev') {
  refreshCarlist();
}
