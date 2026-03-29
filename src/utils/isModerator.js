function getOwnerLogin() {
  return (process.env.BOT_OWNER || process.env.TWITCH_CHANNEL || 'mariantwm')
    .replace('#', '')
    .toLowerCase();
}

function isChannelOwner(tags) {
  const username = (tags.username || '').toLowerCase();
  return tags['badges']?.broadcaster === '1' || username === getOwnerLogin();
}

function isModerator(tags) {
  return tags['mod'] === true || tags['mod'] === '1';
}

function isPrivilegedUser(tags) {
  return isChannelOwner(tags) || isModerator(tags);
}

module.exports = {
  isModerator,
  isChannelOwner,
  isPrivilegedUser,
};
