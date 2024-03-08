import fs from 'fs'
import path from "path";
import { setTimeout as setTimeoutP } from "timers/promises";
import { Scenes } from "telegraf";
import { message, callbackQuery } from "telegraf/filters";
import { onReset, forceStop, onForceStop } from "../middleware/middleware.commands.mjs";
import { uploadPhotoToDrive } from "../modules/upload-photo-to-drive-from-telegram.mjs";
import { translate } from "../telegram.translate.mjs";
const { ua } = translate

export const sceneCarVis = new Scenes.WizardScene(
    'CAR_VIS_SCENE',
    async (ctx) => {

        await ctx.sendChatAction('typing');
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/1.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
        return ctx.wizard.next();
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor
        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_1',
                current_cursor
            })

        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }

        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/2.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();

        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_2',
                current_cursor
            })



        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }

        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/3.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();

        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_3',
                current_cursor
            })


        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/4.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_4',
                current_cursor
            })


        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/5.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_5',
                current_cursor
            })


        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/6.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_6',
                current_cursor
            })


        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/7.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_7',
                current_cursor
            })


        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/8.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_8',
                current_cursor
            })


        if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
            return
        }
        await ctx.replyWithPhoto(
            {
                source: fs.createReadStream(path.join(process.cwd(), 'pics/9.jpg'))
            },
            {
                caption: ua.askPhotoText
            });
    }, 
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_9',
                current_cursor
            })



        if (ctx.session.mileage_update_require) {

            if (ctx.session.carvis.steps_loaded[current_cursor + 1]) {
                return
            }

            await ctx.replyWithPhoto(
                {
                    source: fs.createReadStream(path.join(process.cwd(), 'pics/odometr.jpg'))
                },
                {
                    caption: ua.askOdometrPhoto
                });
            return
        }

        let waiting_time = 0;

        while (Object.values(ctx.session.carvis.steps_loaded).includes('in_progress')) {
            await setTimeoutP(1000);
            waiting_time++
            if (waiting_time >= 60) {
                ctx.reply(ua.groupSavingError)
                console.error({ type: 'groupSavingError', ctx, carvis: ctx.session.carvis.steps_loaded })
                ctx.scene.leave()
                return;
            }
        }
        await ctx.sendChatAction('typing');
        ctx.scene.enter('CAR_VIS_SCENE_VIDEO_PART');

    },
    async (ctx) => {
        const current_cursor = ctx.wizard.cursor

        ctx.wizard.next();
        await uploadPhotoToDrive(
            {
                ctx,
                file_id: ctx.session.file_id,
                photo_name: 'photo_odometr',
                current_cursor
            })



        let waiting_time = 0;

        while (Object.values(ctx.session.carvis.steps_loaded).includes('in_progress')) {
            await setTimeoutP(1000);
            waiting_time++
            if (waiting_time >= 60) {
                ctx.reply(ua.groupSavingError)
                console.error({ type: 'groupSavingError', ctx, carvis: ctx.session.carvis.steps_loaded })
                ctx.scene.leave()
                return;
            }
        }
        await ctx.sendChatAction('typing');
        ctx.scene.enter('CAR_VIS_SCENE_VIDEO_PART');
    }

)

sceneCarVis.command('close', onForceStop);

if (process.env.ENV == 'test') {
    sceneCarVis.command('reset', onReset);
}

sceneCarVis.use((ctx, next) => {

    if (ctx.has(callbackQuery('data'))) {
        return forceStop(ctx, next);
    }

    if (!ctx.session.carvis.steps_loaded) {
        ctx.session.carvis.steps_loaded = {}
    }

    if (ctx.wizard.cursor === 0) {
        return next()
    }

    if (!ctx.has(message('document')) && !ctx.has(message('photo'))) {
        return ctx.reply(ua.onlyPicsAllowed)
    }

    if (ctx.has(message('document'))) {
        const { document } = ctx.update.message
        const { mime_type } = document || photo.pop()
        if (mime_type != 'image/jpeg') {
            return ctx.reply(ua.unsupportedPhoto)
        }
    }

    const { photo, document } = ctx.update.message
    const { file_id } = document || photo.pop()
    ctx.session.file_id = file_id
    return next()
})



