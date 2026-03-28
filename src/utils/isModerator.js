function isModerator(tags) {
  return tags['mod'] === true || tags['badges']?.broadcaster === '1';
}

module.exports = {
  isModerator,
};
