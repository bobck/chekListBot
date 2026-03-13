import fetch from 'node-fetch';
import { db } from '../database.mjs';


export async function fetchDevicePosition(deviceId) {
  const response = await fetch(
    `${process.env.GPS_API_URL}/api/positions?deviceId=${deviceId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `bearer ${process.env.GPS_API_BEARER}`,
        Cookie: `JSESSIONID=${process.env.GPS_API_COOKIE}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error(
      `GPS API positions error: ${response.status} ${response.statusText}`
    );
  }

  const data = await response.json();
  return data;
}

export async function carMileageByPlateNumber(plateNumber) {
  const rows = await db
    .selectFrom('cars')
    .select('gps_device_id')
    .where('car_num', '=', plateNumber)
    .execute();

  if (!rows.length) {
    return { mileage: null };
  }

  const { gps_device_id: deviceId } = rows[0];

  if (!deviceId) {
    return { mileage: null };
  }

  const positions = await fetchDevicePosition(deviceId);

  if (!positions.length) {
    return { mileage: null };
  }

  const totalDistanceMeters = positions[0].attributes?.totalDistance;

  if (totalDistanceMeters == null) {
    return { mileage: null };
  }

  const mileageKm = Math.round(totalDistanceMeters / 1000);
  return { mileage: mileageKm };
}
