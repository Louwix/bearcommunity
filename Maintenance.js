const Discord = require('discord.js');
const bot = new Discord.Client();

bot.login(process.env.TOKEN);

bot.on('ready',(ready) => {
  console.log('Ready')
  bot.user.setActivity('EN MAINTENANCE')
});