require('dotenv').config();
const tmi = require('tmi.js');
const { handleAddCommand } = require('./src/commands/add');
const { handleEditCommand } = require('./src/commands/edit');
const { handleDeleteCommand } = require('./src/commands/del');
const { handleClip } = require('./src/commands/clip');
const { handleUptime } = require('./src/commands/uptime');
const { handleRedes } = require('./src/commands/redes');
const { getCustomCommandResponse } = require('./src/services/customCommandsStore');
const { startTokenAutoRefresh } = require('./src/services/tokenService');

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH,
  },
  channels: [process.env.TWITCH_CHANNEL],
});

client.on('message', async (channel, tags, message, self) => {
  if (self) return;

  const normalizedMessage = message.trim();
  if (!normalizedMessage.startsWith('!')) return;

  const cmd = normalizedMessage.toLowerCase().split(' ')[0];

  try {
    switch (cmd) {
      case '!add':
        handleAddCommand(channel, tags, normalizedMessage, client);
        return;
      case '!edit':
        handleEditCommand(channel, tags, normalizedMessage, client);
        return;
      case '!del':
        handleDeleteCommand(channel, tags, normalizedMessage, client);
        return;
      case '!clip':
        await handleClip(channel, tags, client);
        return;
      case '!uptime':
        await handleUptime(channel, client);
        return;
      case '!redes':
        handleRedes(channel, client);
        return;
      default:
        break;
    }

    const customCommandResponse = getCustomCommandResponse(cmd);
    if (customCommandResponse) {
      client.say(channel, customCommandResponse);
    }
  } catch (error) {
    console.error('[COMMAND ERROR]', error.response?.data || error.message);
  }
});

client.on('connected', (addr, port) => {
  console.log(`[BOT] Conectado a ${addr}:${port}`);
  console.log(`[BOT] Canal: #${process.env.TWITCH_CHANNEL}`);
});

startTokenAutoRefresh();
client.connect().catch(console.error);
