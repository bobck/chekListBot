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
    // return await next()
}