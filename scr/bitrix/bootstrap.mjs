import { refreshCarlistJob } from "./jobs/refresh-car-list-job.mjs";


export function runBitrixJob() {
    console.log('runBitrixJob...')
    try {
        refreshCarlistJob.start();
    } catch (error) {
        console.error({ type: 'refreshCarlistJob.start', error })
        refreshCarlistJob.stop();
        runBitrixJob();
    }
}