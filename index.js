require('dotenv').config();
const tmi = require('tmi.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

const CLIPS_FILE = path.join(__dirname, 'clips.json');

function loadClips() {
  if (!fs.existsSync(CLIPS_FILE)) return [];
  return JSON.parse(fs.readFileSync(CLIPS_FILE, 'utf8'));
}

function saveClip(clip) {
  const clips = loadClips();
  clips.push(clip);
  fs.writeFileSync(CLIPS_FILE, JSON.stringify(clips, null, 2));
}

function isModerator(tags) {
  return tags['mod'] === true || tags['badges']?.broadcaster === '1';
}

const client = new tmi.Client({
  identity: {
    username: process.env.TWITCH_USERNAME,
    password: process.env.TWITCH_OAUTH,
  },
  channels: [process.env.TWITCH_CHANNEL],
});

async function handleClip(channel, tags, client) {
  if (!isModerator(tags)) {
    client.say(channel, `@${tags['display-name']} Solo los mods pueden crear clips.`);
    return;
  }
  try {
    const res = await axios.post(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${process.env.BROADCASTER_ID}`,
      {},
      {
        headers: {
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
        },
      }
    );
    const clipId = res.data.data[0].id;
    const clipUrl = `https://clips.twitch.tv/${clipId}`;
    setTimeout(async () => {
      try {
        const info = await axios.get(
          `https://api.twitch.tv/helix/clips?id=${clipId}`,
          {
            headers: {
              'Client-Id': process.env.TWITCH_CLIENT_ID,
              'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
            },
          }
        );
        const clipData = info.data.data[0];
        saveClip({
          id: clipId,
          url: clipUrl,
          title: clipData?.title || 'Sin título',
          created_at: new Date().toISOString(),
          created_by: tags['display-name'],
          processed: false,
        });
        client.say(channel, `✂️ Clip creado por @${tags['display-name']}: ${clipUrl}`);
        console.log(`[CLIP] Guardado: ${clipUrl}`);
      } catch (e) {
        saveClip({
          id: clipId,
          url: clipUrl,
          title: 'Sin título',
          created_at: new Date().toISOString(),
          created_by: tags['display-name'],
          processed: false,
        });
        client.say(channel, `✂️ Clip creado: ${clipUrl}`);
      }
    }, 5000);
  } catch (err) {
    console.error('[CLIP ERROR]', err.response?.data || err.message);
    client.say(channel, `@${tags['display-name']} No se pudo crear el clip. ¿El stream está en vivo?`);
  }
}

async function handleUptime(channel, client) {
  try {
    const res = await axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${process.env.TWITCH_CHANNEL}`,
      {
        headers: {
          'Client-Id': process.env.TWITCH_CLIENT_ID,
          'Authorization': `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
        },
      }
    );
    const stream = res.data.data[0];
    if (!stream) {
      client.say(channel, 'El stream no está en vivo ahora mismo.');
      return;
    }
    const start = new Date(stream.started_at);
    const now = new Date();
    const diffMs = now - start;
    const hours = Math.floor(diffMs / 3600000);
    const minutes = Math.floor((diffMs % 3600000) / 60000);
    client.say(channel, `⏱️ El stream lleva ${hours}h ${minutes}m en vivo.`);
  } catch (err) {
    console.error('[UPTIME ERROR]', err.message);
    client.say(channel, 'No pude obtener el uptime, perdoná.');
  }
}

function handleRedes(channel, client) {
  client.say(channel, '📺 Twitch: twitch.tv/mariantwm | 🎮 Kick: kick.com/mariantwm | ▶️ YouTube: youtube.com/@mariantwm');
}

client.on('message', (channel, tags, message, self) => {
  if (self) return;
  const cmd = message.trim().toLowerCase().split(' ')[0];
  switch (cmd) {
    case '!clip': handleClip(channel, tags, client); break;
    case '!uptime': handleUptime(channel, client); break;
    case '!redes': handleRedes(channel, client); break;
  }
});

client.on('connected', (addr, port) => {
  console.log(`[BOT] Conectado a ${addr}:${port}`);
  console.log(`[BOT] Canal: #${process.env.TWITCH_CHANNEL}`);
});

client.connect().catch(console.error);
