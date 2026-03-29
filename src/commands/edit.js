const { isPrivilegedUser } = require('../utils/isModerator');
const {
  normalizeCommandName,
  isValidCustomCommandName,
  editCustomCommand,
} = require('../services/customCommandsStore');

const RESERVED_COMMANDS = new Set(['!add', '!edit', '!del', '!clip', '!clips', '!uptime', '!redes']);
const MAX_CUSTOM_COMMAND_RESPONSE_LENGTH = 400;

function handleEditCommand(channel, tags, message, client) {
  if (!isPrivilegedUser(tags)) {
    const ownerLogin = process.env.BOT_OWNER || process.env.TWITCH_CHANNEL || 'mariantwm';
    client.say(channel, `@${tags['display-name']} Solo ${ownerLogin} y los moderadores pueden usar !edit.`);
    return;
  }

  const match = message.trim().match(/^!edit\s+(\S+)\s+(.+)$/i);
  if (!match) {
    client.say(channel, 'Uso: !edit <comando> <respuesta>');
    return;
  }

  const commandName = normalizeCommandName(match[1]);
  const responseText = match[2].trim();

  if (!isValidCustomCommandName(commandName)) {
    client.say(channel, 'Nombre invalido. Usa solo letras, numeros o _, por ejemplo: !discord');
    return;
  }

  if (!responseText) {
    client.say(channel, 'La respuesta del comando no puede estar vacia.');
    return;
  }

  if (responseText.length > MAX_CUSTOM_COMMAND_RESPONSE_LENGTH) {
    client.say(channel, 'La respuesta es muy larga. Maximo: 400 caracteres.');
    return;
  }

  if (/\r|\n/.test(responseText)) {
    client.say(channel, 'La respuesta debe ser de una sola linea.');
    return;
  }

  if (RESERVED_COMMANDS.has(commandName)) {
    client.say(channel, `No podes editar el comando ${commandName}.`);
    return;
  }

  const edited = editCustomCommand(commandName, responseText);
  if (!edited) {
    client.say(channel, `El comando ${commandName} no existe. Usa !add para crearlo.`);
    return;
  }

  client.say(channel, `Comando ${commandName} editado.`);
}

module.exports = {
  handleEditCommand,
};
