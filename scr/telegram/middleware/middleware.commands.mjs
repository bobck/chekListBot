import { translate } from "../telegram.translate.mjs"
import { Markup } from 'telegraf';

const { ua } = translate

export async function onStart(ctx, next) {
    ctx.sendChatAction('typing');
    const button = Markup.button.switchToCurrentChat(ua.searchIcon, '')
    const buttons = [[button]]
    ctx.reply(ua.pressForSearch, Markup.inlineKeyboard(buttons))
    await next()
    return
}

export async function onReset(ctx, next) {
    ctx.session = {}
}

export async function onForceStop(ctx) {
    const { car_num, id } = ctx.session.carvis
    const [short_id] = id.split('-')

    const btn = Markup.inlineKeyboard([
        [
            Markup.button.callback(`${car_num} ${ua.forceStopBtn}`, JSON.stringify({ type: 'FORCE_STOP', id: short_id }))
        ]
    ])
    ctx.reply(ua.forceStopQuestion, btn);
}

export function forceStop(ctx, next) {
    const { callback_query } = ctx.update;
    const { from, data } = callback_query

    const callback_query_data = JSON.parse(data)

    const { type, id } = callback_query_data
    if (type == 'START_CV' && ctx.wizard.cursor == 0) {
        return next();
    }

    ctx.answerCbQuery();

    if (type != 'FORCE_STOP') {
        return
    }

    const [short_id] = ctx.session.carvis.id.split('-')
    if (id != short_id) {
        ctx.reply(ua.oldCarVisForceStop);
        return
    }

    ctx.session = {}
    ctx.reply(ua.forceStopDone);
    return
}