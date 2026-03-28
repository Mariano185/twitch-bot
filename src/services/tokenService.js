const fs = require('fs');
const path = require('path');
const axios = require('axios');

const ENV_PATH = path.join(__dirname, '..', '..', '.env');

let refreshPromise = null;

function replaceOrAppendEnvVar(envContent, key, value) {
  const line = `${key}=${value}`;
  const regex = new RegExp(`^${key}=.*$`, 'm');

  if (regex.test(envContent)) {
    return envContent.replace(regex, line);
  }

  const suffix = envContent.endsWith('\n') ? '' : '\n';
  return `${envContent}${suffix}${line}\n`;
}

function persistTokensInEnv(accessToken, refreshToken) {
  if (!fs.existsSync(ENV_PATH)) {
    return;
  }

  const envContent = fs.readFileSync(ENV_PATH, 'utf8');
  const withAccess = replaceOrAppendEnvVar(envContent, 'TWITCH_ACCESS_TOKEN', accessToken);
  const updated = replaceOrAppendEnvVar(withAccess, 'TWITCH_REFRESH_TOKEN', refreshToken);

  fs.writeFileSync(ENV_PATH, updated);
}

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    const refreshToken = process.env.TWITCH_REFRESH_TOKEN;

    if (!refreshToken) {
      throw new Error('Falta TWITCH_REFRESH_TOKEN para renovar el token de Twitch.');
    }

    const response = await axios.post('https://id.twitch.tv/oauth2/token', null, {
      params: {
        client_id: process.env.TWITCH_CLIENT_ID,
        client_secret: process.env.TWITCH_CLIENT_SECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      },
    });

    const newAccessToken = response.data.access_token;
    const newRefreshToken = response.data.refresh_token;

    process.env.TWITCH_ACCESS_TOKEN = newAccessToken;
    if (newRefreshToken) {
      process.env.TWITCH_REFRESH_TOKEN = newRefreshToken;
    }

    persistTokensInEnv(newAccessToken, process.env.TWITCH_REFRESH_TOKEN);
    console.log('[TOKEN] Access token renovado correctamente.');

    return newAccessToken;
  })();

  try {
    return await refreshPromise;
  } finally {
    refreshPromise = null;
  }
}

function startTokenAutoRefresh() {
  const refreshEveryMs = 3 * 60 * 60 * 1000;

  setInterval(async () => {
    try {
      await refreshAccessToken();
    } catch (error) {
      console.error('[TOKEN ERROR] No se pudo renovar el token:', error.response?.data || error.message);
    }
  }, refreshEveryMs);
}

module.exports = {
  refreshAccessToken,
  startTokenAutoRefresh,
};
