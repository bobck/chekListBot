import express from "express";
import fs from 'fs'
import https from 'https'

import {
    Telegraf,
    session,
    Scenes
} from 'telegraf';

import { SQLite } from "@telegraf/session/sqlite";

import {
    onStart,
    onReset
} from './scr/telegram/middleware/middleware.commands.mjs';
import { onInline } from './scr/telegram/middleware/middleware.inline-handler.mjs';
import { runBitrixJob } from "./scr/bitrix/bootstrap.mjs";
import { carPickResponse } from "./scr/telegram/middleware/middleware.car-pick-response.mjs";
import { enterCarVisScene } from "./scr/telegram/middleware/middleware.enter-car-vis-scene.mjs";
import { sceneCarVis } from "./scr/telegram/scenes/scene.car.vis.mjs";
import { sceneCarVisVideoPart } from "./scr/telegram/scenes/scene.car.vis.video.part.mjs";
import { refreshCarlist } from "./scr/bitrix/modules/refresh-car-list.mjs";

const bot = new Telegraf(process.env.TELEGRAM_API_KEY);
const store = SQLite({
    filename: "./telegraf-sessions.sqlite",
});
bot.use(session({ store }));

const stage = new Scenes.Stage([sceneCarVis, sceneCarVisVideoPart]);
bot.use(stage.middleware());

const app = express();

(async () => {
    runBitrixJob();

    bot.start(onStart);

    bot.inlineQuery(onInline);

    bot.on('chosen_inline_result', carPickResponse);
    bot.on('callback_query', enterCarVisScene);

    if (process.env.ENV == 'test') {
        bot.command('reset', onReset);
        bot.command('refresh_cars', async (ctx, next) => {
            ctx.sendChatAction('typing');
            const result = await refreshCarlist();
            ctx.reply(`Refresh with ${result} cars`)
            console.log({ time: new Date(), result })
            await next();
        });
        bot.launch();
        process.once('SIGINT', () => bot.stop('SIGINT'))
        process.once('SIGTERM', () => bot.stop('SIGTERM'))
    }

    if (process.env.ENV == 'prod') {
        app.use(await bot.createWebhook({ domain: process.env.HOST }));

        const options = {
            key: fs.readFileSync('./private.key.pem'),
            cert: fs.readFileSync('./domain.cert.pem'),
        };

        const server = https.createServer(options, app).listen(process.env.PORT, function () {
            console.log("Express server listening on port " + process.env.PORT);
        });

        app.get('/', function (req, res) {
            res.end("Hi from cheklistBot");
        });
    }

})()