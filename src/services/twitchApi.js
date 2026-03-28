const axios = require('axios');
const { refreshAccessToken } = require('./tokenService');

function getTwitchHeaders() {
  return {
    'Client-Id': process.env.TWITCH_CLIENT_ID,
    Authorization: `Bearer ${process.env.TWITCH_ACCESS_TOKEN}`,
  };
}

async function twitchRequestWithAutoRefresh(requestFn) {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status !== 401) {
      throw error;
    }

    await refreshAccessToken();
    return requestFn();
  }
}

async function createClip() {
  const res = await twitchRequestWithAutoRefresh(() =>
    axios.post(
      `https://api.twitch.tv/helix/clips?broadcaster_id=${process.env.BROADCASTER_ID}`,
      {},
      { headers: getTwitchHeaders() }
    )
  );

  return res.data.data[0].id;
}

async function getClipById(clipId) {
  const res = await twitchRequestWithAutoRefresh(() =>
    axios.get(
      `https://api.twitch.tv/helix/clips?id=${clipId}`,
      { headers: getTwitchHeaders() }
    )
  );

  return res.data.data[0];
}

async function getStreamByChannelLogin(channelLogin) {
  const res = await twitchRequestWithAutoRefresh(() =>
    axios.get(
      `https://api.twitch.tv/helix/streams?user_login=${channelLogin}`,
      { headers: getTwitchHeaders() }
    )
  );

  return res.data.data[0] || null;
}

module.exports = {
  createClip,
  getClipById,
  getStreamByChannelLogin,
};
