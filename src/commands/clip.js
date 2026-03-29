const axios = require('axios');
const { isModerator } = require('../utils/isModerator');
const { saveClip } = require('../services/clipStore');
const { createClip, getClipById } = require('../services/twitchApi');

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'http://192.168.0.29:5678/webhook/nuevo-clip';

async function sendClipWebhook(entry) {
  try {
    await axios.post(WEBHOOK_URL, entry);
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error.response?.data || error.message);
  }
}

async function handleClip(channel, tags, client) {
  if (!isModerator(tags)) {
    client.say(channel, `@${tags['display-name']} Solo los mods pueden crear clips.`);
    return;
  }

  try {
    const clipId = await createClip();
    const clipUrl = `https://clips.twitch.tv/${clipId}`;

    setTimeout(async () => {
      try {
        const clipData = await getClipById(clipId);

        const entry = {
          id: clipId,
          url: clipUrl,
          title: clipData?.title || 'Sin titulo',
          created_at: new Date().toISOString(),
          created_by: tags['display-name'],
          processed: false,
        };

        saveClip(entry);
        await sendClipWebhook(entry);

        client.say(channel, `Clip creado por @${tags['display-name']}: ${clipUrl}`);
        console.log(`[CLIP] Guardado: ${clipUrl}`);
      } catch (_error) {
        const entry = {
          id: clipId,
          url: clipUrl,
          title: 'Sin titulo',
          created_at: new Date().toISOString(),
          created_by: tags['display-name'],
          processed: false,
        };

        saveClip(entry);
        await sendClipWebhook(entry);

        client.say(channel, `Clip creado: ${clipUrl}`);
      }
    }, 5000);
  } catch (error) {
    console.error('[CLIP ERROR]', error.response?.data || error.message);
    client.say(channel, `@${tags['display-name']} No se pudo crear el clip. El stream esta en vivo?`);
  }
}

module.exports = {
  handleClip,
};
