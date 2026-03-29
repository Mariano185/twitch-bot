const fs = require('fs');
const { CUSTOM_COMMANDS_FILE } = require('../config');

let commandCache = null;

function normalizeCommandName(commandName) {
  const trimmed = (commandName || '').trim().toLowerCase();
  if (!trimmed) return '';
  return trimmed.startsWith('!') ? trimmed : `!${trimmed}`;
}

function isValidCustomCommandName(commandName) {
  return /^![a-z0-9_]{2,30}$/.test(commandName);
}

function loadCommandsFromDisk() {
  if (!fs.existsSync(CUSTOM_COMMANDS_FILE)) {
    return {};
  }

  try {
    const raw = fs.readFileSync(CUSTOM_COMMANDS_FILE, 'utf8').trim();
    if (!raw) {
      return {};
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error('[COMMANDS ERROR] No se pudo leer customCommands.json:', error.message);
    return {};
  }
}

function ensureCache() {
  if (commandCache === null) {
    commandCache = loadCommandsFromDisk();
  }

  return commandCache;
}

function persistCommands(commands) {
  fs.writeFileSync(CUSTOM_COMMANDS_FILE, JSON.stringify(commands, null, 2));
}

function setCustomCommand(commandName, responseText) {
  const normalizedName = normalizeCommandName(commandName);
  const commands = ensureCache();

  commands[normalizedName] = responseText;
  persistCommands(commands);

  return normalizedName;
}

function getCustomCommandResponse(commandName) {
  const normalizedName = normalizeCommandName(commandName);
  const commands = ensureCache();
  return commands[normalizedName] || null;
}

module.exports = {
  normalizeCommandName,
  isValidCustomCommandName,
  setCustomCommand,
  getCustomCommandResponse,
};