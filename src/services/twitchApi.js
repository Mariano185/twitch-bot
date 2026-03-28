const axios = require('axios');

function getTwitchHeaders() {
  return {
    'Client-Id': process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
  };
}

async function createClip() {
  const res = await axios.post(
    `https://api.twitch.tv/helix/clips?broadcaster_id=${process.env.BROADCASTER_ID}`,
    {},
    { headers: getTwitchHeaders() }
  );

  return res.data.data[0].id;
}

async function getClipById(clipId) {
  const res = await axios.get(
    `https://api.twitch.tv/helix/clips?id=${clipId}`,
    { headers: getTwitchHeaders() }
  );

  return res.data.data[0];
}

async function getStreamByChannelLogin(channelLogin) {
  const res = await axios.get(
    `https://api.twitch.tv/helix/streams?user_login=${channelLogin}`,
    { headers: getTwitchHeaders() }
  );

  return res.data.data[0] || null;
}

module.exports = {
  createClip,
  getClipById,
  getStreamByChannelLogin,
};
