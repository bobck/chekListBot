import { Telegram } from 'telegraf';
import { v4 as uuidv4 } from 'uuid';
import {
  getFolderIdByParentIdAndName,
  createFolderInParentFolder,
} from '../../drive/drive.utils.mjs';
import { db } from '../../database.mjs';
import { carMileageByPlateNumber } from '../../gps/gps.utils.mjs';
import { daysWithNoMileageByCarId } from '../../bq/bq.utils.mjs';

import { translate } from '../telegram.translate.mjs';
const { ua } = translate;

const bot = new Telegram(process.env.TELEGRAM_API_KEY);

export async function enterCarVisScene(ctx, next) {
  const { callback_query } = ctx.update;
  const { from, data } = callback_query;

  const callback_query_data = JSON.parse(data);

  const { type, id, car_num } = callback_query_data;

  await ctx.answerCbQuery();

  if (type != 'START_CV') {
    await next();
    return;
  }

  await ctx.editMessageText(`Карвіз для авто ${car_num} розпочато`);
  await ctx.sendChatAction('typing');

  try {
    const [carDate, carVisFolderName] = new Date().toISOString().split('T');

    ctx.session = {
      carvis: {
        id: uuidv4(),
        car_id: id,
        car_num,
        car_vis_date: carDate,
        created_by_id: from.id,
        created_by_name: from.first_name,
        created_at: new Date().toISOString(),
        mapon_mileage: null,
        steps_loaded: {},
        photos: {},
      },
    };
    await ctx.reply(ua.waiting_preparing);
    await ctx.sendChatAction('typing');

    await daysWithNoMileageCheck({ ctx, id });

    try {
      const { mileage } = await carMileageByPlateNumber(car_num);

      if (mileage != null) {
        ctx.session.carvis.mapon_mileage = mileage;
      }
    } catch (error) {
      console.error({
        type: 'carMileageByPlateNumber',
        callback_query_data,
        error,
      });
    }

    const rootFolderId = process.env.CAR_VIS_FOLDER_ID;

    const carFolderId = await getOrCreateFolder(car_num, rootFolderId);
    const carDateFolderId = await getOrCreateFolder(carDate, carFolderId);
    const carVisFolderId = await getOrCreateFolder(
      carVisFolderName,
      carDateFolderId
    );

    ctx.session.carvis.car_folder_id = carFolderId;
    ctx.session.carvis.car_date_folder_id = carDateFolderId;
    ctx.session.carvis.car_vis_folder_id = carVisFolderId;
    ctx.session.carvis.car_vis_folder_link = `https://drive.google.com/drive/folders/${carVisFolderId}`;

    await ctx.reply(ua.reglament);

    if (ctx.session.mileage_update_require) {
      await ctx.reply(ua.needOdometrPhoto);
    }

    await ctx.scene.enter('CAR_VIS_SCENE');
  } catch (error) {
    console.error('Критическая ошибка в enterCarVisScene:', {
      error_at: new Date().toISOString(),
      user_id: from.id,
      car_num: car_num,
      error,
    });
    await ctx.reply(ua.errorWhileEnterCarVisScene);
  }

  return await next();
}

async function daysWithNoMileageCheck({ ctx, id }) {
  if (process.env.SKIP_MILEAGE_CHECK == 'YES') {
    return;
  }

  await ctx.reply(ua.preparing_mileage_info);

  try {
    const { days_with_no_mileage_update } = await daysWithNoMileageByCarId({
      id,
    });

    if (
      days_with_no_mileage_update == null ||
      days_with_no_mileage_update >
        parseInt(process.env.DAYS_WITH_NO_MILEAGE_UPDATE_ALLOWED)
    ) {
      ctx.session.mileage_update_require = true;
    }
  } catch (error) {
    console.error({ type: 'daysWithNoMileageByCarId', error });
    ctx.session.mileage_update_require = true;
  }
  return;
}

async function getOrCreateFolder(name, parentId) {
  if (!parentId) {
    throw new Error(
      `Отсутствует ID родительской папки для создания папки "${name}"`
    );
  }

  let folderId = await getFolderIdByParentIdAndName({ name, parentId });

  if (!folderId) {
    folderId = await createFolderInParentFolder({ name, parentId });
  }

  if (!folderId) {
    throw new Error(`Не удалось получить или создать папку "${name}"`);
  }

  return folderId;
}
