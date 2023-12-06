import got from 'got';
import { uploadFileToParentId } from "../../drive/drive.utils.mjs";
import { translate } from "../telegram.translate.mjs";
const { ua } = translate

export async function uploadPhotoToDrive({ ctx, photo_name, file_id, current_cursor }) {
    ctx.session.carvis.steps_loaded[current_cursor] = 'in_progress'

    if (ctx.session.carvis.steps_loaded[current_cursor - 1] == 'done' || current_cursor == 2) {
        await ctx.reply(ua.waiting);
    }
    await ctx.sendChatAction('typing');
    const fileLink = await ctx.telegram.getFileLink(file_id)
    const { href } = fileLink

    const streamOptions = {
        retry: {
            limit: 6,
            methods: ['GET'],
            statusCodes: [408, 413, 429, 500, 502, 503, 504],
            errorCodes: ['ETIMEDOUT', 'ECONNRESET', 'EADDRINUSE', 'ECONNREFUSED', 'EPIPE', 'ENOTFOUND', 'ENETUNREACH', 'EAI_AGAIN'],
            calculateDelay: ({ attemptCount, retryOptions, error, computedValue }) => {
                return Math.min(computedValue * 2, retryOptions.maxRetryAfter || Infinity);
            }
        }
    };

    const createReadStream = await got.stream(href, streamOptions).on('retry', (attempt, error, retryCount) => {
        console.log(`Attempt: ${attempt}, Retry Count: ${retryCount}, Error: ${error.message}`);
        console.log({ error });

    });;

    const { car_num, car_vis_folder_id } = ctx.session.carvis

    const photo_id = await uploadFileToParentId({
        createReadStream,
        name: `${car_num} - ${photo_name}.jpg`,
        parentId: car_vis_folder_id
    })
    if (!ctx.session.carvis.photos) {
        ctx.session.carvis.photos = {}
    }
    ctx.session.carvis.photos[`${photo_name}_id`] = photo_id;
    ctx.session.carvis.photos[`${photo_name}_url`] = `https://drive.google.com/uc?id=${photo_id}&export=jpg`;
    ctx.session.carvis.steps_loaded[current_cursor] = 'done'
    return
}

export async function uploadVideoToDrive({ ctx, video_name, file_id }) {

    const fileLink = await ctx.telegram.getFileLink(file_id)
    const { href } = fileLink
    const createReadStream = got.stream(href)

    const { car_num, car_vis_folder_id } = ctx.session.carvis

    const video_id = await uploadFileToParentId({
        createReadStream,
        name: `${car_num} - ${video_name}.mp4`,
        parentId: car_vis_folder_id
    })

    return video_id
}