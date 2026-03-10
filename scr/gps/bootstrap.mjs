import { refreshGpsDevicesJob } from './jobs/refresh-gps-devices-job.mjs';

export function runGpsJob() {
  console.log('runGpsJob...');
  try {
    refreshGpsDevicesJob.start();
  } catch (error) {
    console.error({ type: 'refreshGpsDevicesJob.start', error });
    refreshGpsDevicesJob.stop();
    runGpsJob();
  }
}
