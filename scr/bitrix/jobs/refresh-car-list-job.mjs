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
            console.error({ type: 'onTick refreshCarlist', error })
        }
    }
});

export const refreshCarlistJob = job;
