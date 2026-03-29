const { isPrivilegedUser } = require('../utils/isModerator');
const {
  normalizeCommandName,
  isValidCustomCommandName,
  deleteCustomCommand,
} = require('../services/customCommandsStore');

const RESERVED_COMMANDS = new Set(['!add', '!edit', '!del', '!clip', '!uptime', '!redes']);

function handleDeleteCommand(channel, tags, message, client) {
  if (!isPrivilegedUser(tags)) {
    const ownerLogin = process.env.BOT_OWNER || process.env.TWITCH_CHANNEL || 'mariantwm';
    client.say(channel, `@${tags['display-name']} Solo ${ownerLogin} y los moderadores pueden usar !del.`);
    return;
  }

  const match = message.trim().match(/^!del\s+(\S+)$/i);
  if (!match) {
    client.say(channel, 'Uso: !del <comando>');
    return;
  }

  const commandName = normalizeCommandName(match[1]);

  if (!isValidCustomCommandName(commandName)) {
    client.say(channel, 'Nombre invalido. Usa solo letras, numeros o _, por ejemplo: !discord');
    return;
  }

  if (RESERVED_COMMANDS.has(commandName)) {
    client.say(channel, `No podes eliminar el comando ${commandName}.`);
    return;
  }

  const deleted = deleteCustomCommand(commandName);
  if (!deleted) {
    client.say(channel, `El comando ${commandName} no existe.`);
    return;
  }

  client.say(channel, `Comando ${commandName} eliminado.`);
}

module.exports = {
  handleDeleteCommand,
};
