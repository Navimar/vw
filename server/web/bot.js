/**
 * Created by igor on 16/02/2017.
 */
const TelegramBot = require('telebot');
// const Telegraf = require('telegraf');
const config = require('../logic/config');

const bot = new TelegramBot(config.botkey);
// const bot = new Telegraf(config.botkey);
bot.connect();
// bot.start((ctx) => ctx.reply('Welcome')); 
// bot.launch();

module.exports = bot;