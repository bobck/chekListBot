import { refreshCarlistJob } from "./jobs/refresh-car-list-job.mjs";


export function runBitrixJob() {
    console.log('runBitrixJob...')
    try {
        refreshCarlistJob.start();
    } catch (error) {
        console.error('sync error, app down...')
        console.error({ error })
        console.error('Trying to restart...')

        refreshCarlistJob.stop();
        runBitrixJob();
    }
}