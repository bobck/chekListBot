import { Telegram } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import {
    getFolderIdByParentIdAndName,
    createFolderInParentFolder
} from '../../drive/drive.utils.mjs';

import { translate } from '../telegram.translate.mjs';
const { ua } = translate

const bot = new Telegram(process.env.TELEGRAM_API_KEY);

export async function enterCarVisScene(ctx, next) {
    const { callback_query } = ctx.update;
    const { from, data } = callback_query

    const callback_query_data = JSON.parse(data)

    const { type, id, car_num } = callback_query_data

    if (type != 'START_CV') {
        ctx.answerCbQuery()
        await next()
        return
    }
    await ctx.sendChatAction('typing');

    await ctx.reply(ua.waiting_preparing)

    await ctx.sendChatAction('typing');
    const [carDate, carVisFolderName] = new Date().toISOString().split('T');

    ctx.session = {}
    ctx.session.carvis = {}
    ctx.session.carvis.id = uuidv4();
    ctx.session.carvis.car_id = id
    ctx.session.carvis.car_num = car_num
    ctx.session.carvis.car_vis_date = carDate;
    ctx.session.carvis.created_by_id = from.id
    ctx.session.carvis.created_by_name = from.first_name
    ctx.session.carvis.created_at = new Date().toISOString();

    const carFolderId = await getFolderIdByParentIdAndName({ name: car_num, parentId: process.env.CAR_VIS_FOLDER_ID });
    ctx.session.carvis.car_folder_id = carFolderId
    if (!carFolderId) {
        ctx.session.carvis.car_folder_id = await createFolderInParentFolder({ name: car_num, parentId: process.env.CAR_VIS_FOLDER_ID })
    }

    const carDateFolderId = await getFolderIdByParentIdAndName({ name: carDate, parentId: ctx.session.carvis.car_folder_id });
    ctx.session.carvis.car_date_folder_id = carDateFolderId;
    if (!carDateFolderId) {
        ctx.session.carvis.car_date_folder_id = await createFolderInParentFolder({ name: carDate, parentId: ctx.session.carvis.car_folder_id });
    }

    ctx.session.carvis.car_vis_folder_id = await createFolderInParentFolder({ name: carVisFolderName, parentId: ctx.session.carvis.car_date_folder_id });

    ctx.session.carvis.car_vis_folder_link = `https://drive.google.com/drive/folders/${ctx.session.carvis.car_vis_folder_id}`

    await ctx.reply(ua.reglament)
    await ctx.scene.enter('CAR_VIS_SCENE');
    await ctx.answerCbQuery()
    return await next()
}