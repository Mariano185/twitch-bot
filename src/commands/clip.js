const axios = require('axios');
const { isPrivilegedUser } = require('../utils/isModerator');
const { saveClip } = require('../services/clipStore');
const { createClip, getClipById } = require('../services/twitchApi');

const WEBHOOK_URL =
  process.env.N8N_WEBHOOK_URL ||
  'http://192.168.0.29:5678/webhook/nuevo-clip';
const NON_PRIVILEGED_CLIP_COOLDOWN_MS = 15 * 60 * 1000;

const clipCooldownByUser = new Map();

function getClipCooldownUserKey(tags) {
  return (tags['user-id'] || tags.username || tags['display-name'] || '')
    .toString()
    .toLowerCase();
}

function formatRemainingCooldown(remainingMs) {
  const totalSeconds = Math.ceil(remainingMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  if (minutes <= 0) {
    return `${seconds}s`;
  }

  return `${minutes}m ${seconds}s`;
}

function canUseClipCommand(channel, tags, client) {
  if (isPrivilegedUser(tags)) {
    return true;
  }

  const userKey = getClipCooldownUserKey(tags);
  if (!userKey) {
    return true;
  }

  const now = Date.now();
  const lastUse = clipCooldownByUser.get(userKey);

  if (lastUse && now - lastUse < NON_PRIVILEGED_CLIP_COOLDOWN_MS) {
    const remainingMs = NON_PRIVILEGED_CLIP_COOLDOWN_MS - (now - lastUse);
    const remaining = formatRemainingCooldown(remainingMs);

    client.say(
      channel,
      `@${tags['display-name']} Este comando tiene cooldown de 15m para usuarios sin rango. Te faltan ${remaining}.`
    );
    return false;
  }

  clipCooldownByUser.set(userKey, now);
  return true;
}

async function sendClipWebhook(entry) {
  try {
    await axios.post(WEBHOOK_URL, entry);
  } catch (error) {
    console.error('[WEBHOOK ERROR]', error.response?.data || error.message);
  }
}

async function handleClip(channel, tags, client) {
  if (!canUseClipCommand(channel, tags, client)) {
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
