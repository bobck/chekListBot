import { Telegram } from 'telegraf';

const bot = new Telegram(process.env.TELEGRAM_API_KEY);

export async function carPickResponse(ctx, next) {
    const { chosen_inline_result } = ctx.update
    const { result_id, from } = chosen_inline_result

    const { id, car_num } = JSON.parse(result_id)

    const reply_markup = {
        inline_keyboard: [[{
            text: car_num,
            callback_data: JSON.stringify({ type: 'START_CV', id, car_num })
        }]]
    }

    bot.sendMessage(from.id, 'Обери авто щоб почати карвіз', { reply_markup })
    await next()
    return
}