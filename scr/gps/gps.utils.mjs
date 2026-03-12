import fetch from 'node-fetch';
import { devLog } from '../utils.mjs';
import { db } from '../database.mjs';

export async function fetchGpsDevices() {
  devLog('GPS API: fetching devices from', process.env.GPS_API_URL);

  const response = await fetch(`${process.env.GPS_API_URL}/api/devices`, {
    method: 'GET',
    headers: {
      Authorization: `bearer ${process.env.GPS_API_BEARER}`,
      Cookie: `JSESSIONID=${process.env.GPS_API_COOKIE}`,
    },
  });

  if (!response.ok) {
    throw new Error(`GPS API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  devLog(`GPS API: received ${data.length} devices`);
  return data;
}

export async function fetchDevicePosition(deviceId) {
  devLog(`GPS API: fetching position for deviceId=${deviceId}`);

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
  devLog(`GPS API: received ${data.length} position(s) for deviceId=${deviceId}`);
  return data;
}

export async function carMileageByPlateNumber(plateNumber) {
  devLog(`GPS API: looking up device for plate '${plateNumber}' in cars table`);

  const rows = await db
    .selectFrom('cars')
    .select('gps_device_id')
    .where('car_num', '=', plateNumber)
    .execute();

  if (!rows.length) {
    devLog(`GPS API: no car found for plate '${plateNumber}'`);
    return { mileage: null };
  }

  const { gps_device_id: deviceId } = rows[0];

  if (!deviceId) {
    devLog(`GPS API: no gps_device_id found for plate '${plateNumber}'`);
    return { mileage: null };
  }

  devLog(`GPS API: found deviceId=${deviceId} for plate '${plateNumber}'`);

  const positions = await fetchDevicePosition(deviceId);

  if (!positions.length) {
    devLog(`GPS API: no position data for deviceId=${deviceId}`);
    return { mileage: null };
  }

  const totalDistanceMeters = positions[0].attributes?.totalDistance;

  if (totalDistanceMeters == null) {
    devLog(`GPS API: totalDistance not available for deviceId=${deviceId}`);
    return { mileage: null };
  }

  const mileageKm = Math.round(totalDistanceMeters / 1000);
  devLog(`GPS API: mileage for '${plateNumber}' = ${mileageKm} km`);
  return { mileage: mileageKm };
}
