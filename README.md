# Twitch Bot para mariantwm

Bot de Twitch en Node.js con:
- Creacion de clips (!clip)
- Uptime (!uptime)
- Redes (!redes)
- Comandos dinamicos creados/gestionados desde chat (!add, !edit, !del)
- Auto-refresh de token de Twitch
- Webhook opcional cuando se crea un clip

## Requisitos
- Node.js 18+
- Cuenta de Twitch con app registrada
- OAuth y permisos para crear clips

## Instalacion
1. Instalar dependencias:

```bash
npm install
```

2. Crear archivo .env usando .env.example.

3. Iniciar bot:

```bash
npm start
```

## Variables de entorno
Usar el archivo .env.example como base.

Variables clave:
- TWITCH_USERNAME
- TWITCH_OAUTH
- TWITCH_CHANNEL
- BOT_OWNER
- BROADCASTER_ID
- TWITCH_CLIENT_ID
- TWITCH_CLIENT_SECRET
- TWITCH_ACCESS_TOKEN
- TWITCH_REFRESH_TOKEN
- N8N_WEBHOOK_URL

## Comandos
Comandos base:
- !clip: crea clip
- !uptime: muestra tiempo en vivo
- !redes: muestra redes
- !add <comando> <respuesta>: crea comando personalizado
- !edit <comando> <respuesta>: edita comando personalizado
- !del <comando>: elimina comando personalizado

### Permisos y cooldown
- BOT_OWNER y moderadores:
  - Uso ilimitado de !clip
  - Pueden usar !add, !edit y !del
- Usuarios sin rango:
  - Pueden usar !clip con cooldown de 15 minutos por usuario

## Donde se guardan los datos
- Clips: clips.json (raiz del proyecto)
- Comandos personalizados: customCommands.json (raiz del proyecto)

La persistencia en JSON es correcta para un canal pequeno o mediano:
- Ventajas: simple, rapida, sin base de datos externa
- Limites: concurrencia, escalado y auditoria

Si en el futuro crece mucho el volumen, conviene migrar a SQLite o Redis.

## Seguridad (repo publico)
Buenas practicas ya aplicadas:
- .env y .env.* ignorados por git
- .env.example versionado sin secretos
- Archivos runtime ignorados: clips.json y customCommands.json

Checklist recomendado:
1. Nunca subir .env ni secretos al repo.
2. Rotar inmediatamente cualquier token que se haya compartido por chat o commits.
3. Configurar Secret Scanning y Push Protection en GitHub.
4. Usar secretos en CI/CD o variables de entorno del servidor, no valores hardcodeados.
5. Revisar permisos OAuth minimos necesarios para el bot.

## Notas de despliegue
Si ejecutas con systemd:
1. Actualizar codigo (git pull)
2. Verificar variables de entorno
3. Reiniciar servicio

Ejemplo:

```bash
systemctl restart twitch-bot
```
