const fs = require('fs');
const { CLIPS_FILE } = require('../config');

function loadClips() {
  if (!fs.existsSync(CLIPS_FILE)) return [];
  return JSON.parse(fs.readFileSync(CLIPS_FILE, 'utf8'));
}

function saveClip(clip) {
  const clips = loadClips();
  clips.push(clip);
  fs.writeFileSync(CLIPS_FILE, JSON.stringify(clips, null, 2));
}

module.exports = {
  loadClips,
  saveClip,
};
