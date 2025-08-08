import { Scenes, Markup } from "telegraf";
import { message, callbackQuery } from "telegraf/filters";
import { onReset } from "../middleware/middleware.commands.mjs";
import { uploadVideoToDrive } from "../modules/upload-photo-to-drive-from-telegram.mjs";
import { insertRowWithDlm } from "../../bq/bq.utils.mjs";
import { translate } from "../telegram.translate.mjs";
const { ua } = translate

export const sceneCarVisVideoPart = new Scenes.WizardScene(
    'CAR_VIS_SCENE_VIDEO_PART',
    (ctx) => {
        const btn = Markup.inlineKeyboard([
            [
                Markup.button.callback(ua.hasVideo, JSON.stringify({ type: 'hasVideo' })),
                Markup.button.callback(ua.skipVideo, JSON.stringify({ type: 'skipVideo' }))
            ]
        ])
        ctx.reply(ua.isVideoRequired, btn);
        return ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.sendChatAction('typing');
        if (!ctx.has(callbackQuery('data'))) {
            return
        }

        ctx.answerCbQuery();
        
        const { callback_query } = ctx.update
        const { data } = callback_query
        const { type } = JSON.parse(data)

        if (type == 'skipVideo') {
            ctx.session.carvis.has_video_360 = false;
            await ctx.editMessageText(ua.skipVideoMsg);
            await saveAndLeave(ctx);
            return
        }

        await ctx.editMessageReplyMarkup(null);
        ctx.session.carvis.has_video_360 = true;
        ctx.reply(ua.video360Reglament);
        ctx.wizard.next();
    },
    async (ctx) => {
        await ctx.sendChatAction('typing');
        if (!ctx.has(message('video')) && !ctx.has(message('document'))) {
            ctx.reply(ua.onlyVideoAllowed)
            return
        }

        if (ctx.has(message('document'))) {
            const { document } = ctx.update.message
            const { mime_type } = document
            if (mime_type != 'video/mp4') {
                ctx.reply(ua.unsupportedVideo)
                return
            }
        }

        const { document, video } = ctx.update.message
        const { file_id } = video || document;
        await ctx.reply(ua.waitingVideoUpload);
        await ctx.sendChatAction('typing');

        try {
            const video_id = await uploadVideoToDrive({ ctx, video_name: 'video_360', file_id })
            ctx.session.carvis.video_360_id = video_id
            ctx.session.carvis.video_360_url = `https://drive.google.com/uc?id=${video_id}&export=mp4`

            return await saveAndLeave(ctx);
        } catch (e) {
            const { description } = e?.response || {}
            if (description == 'Bad Request: file is too big') {
                await ctx.reply(ua.tooBigFile);
                return
            }
        }

    }
)

async function saveAndLeave(ctx) {
    await ctx.sendChatAction('typing');
    await ctx.reply(ua.savingCarVis);
    await ctx.sendChatAction('typing');

    const {
        id,
        car_id,
        car_num,
        mapon_mileage,
        car_vis_date,
        created_by_id,
        created_by_name,
        created_at,
        car_folder_id,
        car_date_folder_id,
        car_vis_folder_id,
        car_vis_folder_link,
        photos,
        has_video_360,
        video_360_id,
        video_360_url
    } = ctx.session.carvis

    const {
        photo_1_id,
        photo_1_url,
        photo_2_id,
        photo_2_url,
        photo_3_id,
        photo_3_url,
        photo_4_id,
        photo_4_url,
        photo_5_id,
        photo_5_url,
        photo_6_id,
        photo_6_url,
        photo_7_id,
        photo_7_url,
        photo_8_id,
        photo_8_url,
        photo_9_id,
        photo_9_url,
        photo_odometr_id,
        photo_odometr_url,
    } = photos

    const row = {
        id,
        car_id,
        car_num,
        car_vis_date,
        car_vis_folder_id,
        car_vis_folder_link,
        status: 'done',
        created_by_id,
        created_by_name,
        created_at,
        done_at: new Date().toISOString(),
        photo_1_id,
        photo_1_url,
        photo_2_id,
        photo_2_url,
        photo_3_id,
        photo_3_url,
        photo_4_id,
        photo_4_url,
        photo_5_id,
        photo_5_url,
        photo_6_id,
        photo_6_url,
        photo_7_id,
        photo_7_url,
        photo_8_id,
        photo_8_url,
        photo_9_id,
        photo_9_url,
        has_video_360,
        video_360_id,
        video_360_url,
        photo_odometr_id,
        photo_odometr_url,
        mapon_mileage
    };
    try {
        await insertRowWithDlm(row)
        await ctx.scene.leave();
        ctx.session = {}
        await ctx.reply(`${ua.done}\n\n${id}\n\n${car_vis_folder_link}`)
        return
    }
    catch (error) {
        console.log({ function: 'saveAndLeave', error })
        await ctx.reply(ua.rowSavingError)
    }

}

if (process.env.ENV == 'test') {

    sceneCarVisVideoPart.command('reset', onReset);


    sceneCarVisVideoPart.command('s0', ctx => {
        const current_cursor = ctx.wizard.cursor
        console.log({ set_to_0: true, current_cursor })
        ctx.wizard.selectStep(0)
    });

    sceneCarVisVideoPart.command('s1', ctx => {
        const current_cursor = ctx.wizard.cursor
        console.log({ set_to_1: true, current_cursor })
        ctx.wizard.selectStep(1)
    });

    sceneCarVisVideoPart.command('s2', ctx => {
        const current_cursor = ctx.wizard.cursor
        console.log({ set_to_2: true, current_cursor })
        ctx.wizard.selectStep(2)
    });

    sceneCarVisVideoPart.command('s3', ctx => {
        const current_cursor = ctx.wizard.cursor
        console.log({ set_to_3: true, current_cursor })
        ctx.wizard.selectStep(3)
    });

}



