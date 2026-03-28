const { getStreamByChannelLogin } = require('../services/twitchApi');

async function handleUptime(channel, client) {
  try {
    const stream = await getStreamByChannelLogin(process.env.TWITCH_CHANNEL);

    if (!stream) {
      client.say(channel, 'El stream no esta en vivo ahora mismo.');
      return;
    }

    const start = new Date(stream.started_at);
    const now = new Date();
    const diffMs = now - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);

    client.say(channel, `El stream lleva ${hours}h ${minutes}m en vivo.`);
  } catch (error) {
    console.error('[UPTIME ERROR]', error.message);
    client.say(channel, 'No pude obtener el uptime, perdona.');
  }
}

module.exports = {
  handleUptime,
};
