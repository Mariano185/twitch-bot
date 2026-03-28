require('dotenv').config();
const tmi = require('tmi.js');
const { handleClip } = require('./src/commands/clip');
const { handleUptime } = require('./src/commands/uptime');
const { handleRedes } = require('./src/commands/redes');
const { startTokenAutoRefresh } = require('./src/services/tokenService');

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH,
  },
  channels: [process.env.TWITCH_CHANNEL],
});

client.on('message', (channel, tags, message, self) => {
  if (self) return;

  const cmd = message.trim().toLowerCase().split(' ')[0];

  switch (cmd) {
    case '!clips':
    case '!clip':
      handleClip(channel, tags, client);
      break;
    case '!uptime':
      handleUptime(channel, client);
      break;
    case '!redes':
      handleRedes(channel, client);
      break;
    default:
      break;
  }
});

client.on('connected', (addr, port) => {
  console.log(`[BOT] Conectado a ${addr}:${port}`);
  console.log(`[BOT] Canal: #${process.env.TWITCH_CHANNEL}`);
});

startTokenAutoRefresh();
client.connect().catch(console.error);
