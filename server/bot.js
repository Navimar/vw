/**
 * Created by igor on 16/02/2017.
 */
const TelegramBot = require('telebot');

// const bot = new TelegramBot('320938705:AAGpcdMe9oIhFYuu11MjU4djJnj1maijkpQ');
const bot = new TelegramBot('602673396:AAFHMT_6QTnuPnDBYNLKDGFiiVnwbvZYYHM');

bot.connect();

module.exports = bot;