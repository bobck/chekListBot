import { CronJob } from 'cron';
import { refreshGpsDevices } from '../modules/refresh-gps-devices.mjs';

const cronTime = '*/45 * * * *';

const timeZone = 'Europe/Kiev';

const job = CronJob.from({
  cronTime,
  timeZone,
  onTick: async () => {
    try {
      console.log({ job: 'refreshGpsDevices', time: new Date() });
      await refreshGpsDevices();
    } catch (error) {
      console.error({ type: 'onTick refreshGpsDevices', error });
    }
  },
});

export const refreshGpsDevicesJob = job;
