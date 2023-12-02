import { CronJob } from 'cron';
import { refreshCarlist } from '../modules/refresh-car-list.mjs';

const cronTime = '*/45 * * * *';

const timeZone = 'Europe/Kiev';

const job = CronJob.from({
    cronTime,
    timeZone,
    onTick: async () => {
        try {
            console.log({ job: 'refreshCarlist', time: new Date() })
            await refreshCarlist();
        } catch (error) {
            console.error('Error occurred in onTick refreshCarlist');
            console.error(error);
        }
    }
});

export const refreshCarlistJob = job;
