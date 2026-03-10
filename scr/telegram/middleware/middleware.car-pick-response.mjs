import { Telegram } from 'telegraf';
import { devLog } from '../../utils.mjs';

const bot = new Telegram(process.env.TELEGRAM_API_KEY);

export async function carPickResponse(ctx, next) {
  try {
    const { chosen_inline_result } = ctx.update;
    const { result_id, from } = chosen_inline_result;

    const { id, car_num } = JSON.parse(result_id);
    devLog(`Telegram API: user ${from.id} chose inline result for car '${car_num}'`);

    const reply_markup = {
      inline_keyboard: [
        [
          {
            text: car_num,
            callback_data: JSON.stringify({ type: 'START_CV', id, car_num }),
          },
        ],
      ],
    };

    devLog(`Telegram API: sending message to user ${from.id} with start CV button`);
    bot.sendMessage(from.id, 'Обери авто щоб почати карвіз', { reply_markup });
    await next();
    return;
  } catch (error) {
    devLog(`Telegram API Error: carPickResponse failed - ${error.message}`);
    console.error({ type: 'carPickResponse Error', error });
  }
}
