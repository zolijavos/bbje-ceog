# BMAD-Discord Integráció - Setup Guide

**Verzió**: 1.0
**Dátum**: 2025-12-21
**Szerző**: BMad Master

---

## Tartalom

1. [Áttekintés](#1-áttekintés)
2. [Discord Bot Létrehozása](#2-discord-bot-létrehozása)
3. [MCP Server Telepítése](#3-mcp-server-telepítése)
4. [BMAD Konfiguráció](#4-bmad-konfiguráció)
5. [Webhook Beállítás (Egyszerű)](#5-webhook-beállítás-egyszerű)
6. [Parancsok és Használat](#6-parancsok-és-használat)
7. [Hibaelhárítás](#7-hibaelhárítás)

---

## 1. Áttekintés

### Architektúra

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Discord   │◄───►│  MCP Server │◄───►│    BMAD     │
│   Server    │     │  (Bridge)   │     │    Core     │
└─────────────┘     └─────────────┘     └─────────────┘
      │                    │                   │
      ▼                    ▼                   ▼
  Felhasználók        Parancs routing      Workflow-k
  Csatornák           Event handling       Agent-ek
  Üzenetek            State management     Task-ok
```

### Két Megközelítés

| Megközelítés | Komplexitás | Képességek |
|--------------|-------------|------------|
| **Webhook** | Egyszerű | Egyirányú (BMAD → Discord) |
| **MCP Bot** | Közepes | Kétirányú (Discord ↔ BMAD) |

---

## 2. Discord Bot Létrehozása

### 2.1 Discord Developer Portal

1. Nyisd meg: https://discord.com/developers/applications
2. Kattints: **"New Application"**
3. Név: `BMAD Bot` (vagy tetszőleges)
4. Kattints: **"Create"**

### 2.2 Bot Token Generálása

1. Bal menü → **"Bot"**
2. Kattints: **"Add Bot"** → **"Yes, do it!"**
3. **TOKEN** szekció → **"Reset Token"** → **"Copy"**

```bash
# Mentsd el biztonságos helyre!
DISCORD_BOT_TOKEN=MTIzNDU2Nzg5MDEyMzQ1Njc4OQ.XXXXXX.XXXXXXXXXXXXXXXXXXXXXXXX
```

⚠️ **FONTOS**: A token TITKOS! Ne commitold git-be!

### 2.3 Bot Jogosultságok (Intents)

A **"Bot"** oldalon engedélyezd:

| Intent | Szükséges | Cél |
|--------|-----------|-----|
| ✅ MESSAGE CONTENT | IGEN | Üzenetek olvasása |
| ✅ SERVER MEMBERS | Opcionális | Felhasználók kezelése |
| ✅ PRESENCE | Opcionális | Online státusz |

### 2.4 Bot Meghívása a Szerverre

1. Bal menü → **"OAuth2"** → **"URL Generator"**
2. **SCOPES**: `bot`, `applications.commands`
3. **BOT PERMISSIONS**:
   - ✅ Send Messages
   - ✅ Read Message History
   - ✅ Use Slash Commands
   - ✅ Embed Links
   - ✅ Attach Files
   - ✅ Add Reactions
   - ✅ Mention Everyone (opcionális)

4. Másold ki a generált URL-t
5. Nyisd meg böngészőben → Válaszd ki a szervert → **"Authorize"**

---

## 3. MCP Server Telepítése

### 3.1 Projekt Struktúra

```bash
mkdir -p mcp-servers/discord
cd mcp-servers/discord
npm init -y
```

### 3.2 Függőségek Telepítése

```bash
npm install discord.js @modelcontextprotocol/sdk dotenv
```

### 3.3 MCP Discord Server Kód

Hozd létre: `mcp-servers/discord/server.js`

```javascript
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { Client, GatewayIntentBits, EmbedBuilder } from 'discord.js';
import dotenv from 'dotenv';

dotenv.config();

// Discord Client
const discord = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

// MCP Server
const server = new Server(
  { name: 'discord-mcp', version: '1.0.0' },
  { capabilities: { tools: {} } }
);

// === MCP TOOLS ===

// Tool: Üzenet küldése csatornára
server.setRequestHandler('tools/list', async () => ({
  tools: [
    {
      name: 'discord_send_message',
      description: 'Üzenet küldése Discord csatornára',
      inputSchema: {
        type: 'object',
        properties: {
          channel_id: { type: 'string', description: 'Discord csatorna ID' },
          content: { type: 'string', description: 'Üzenet szövege' },
          embed: {
            type: 'object',
            description: 'Opcionális embed objektum',
            properties: {
              title: { type: 'string' },
              description: { type: 'string' },
              color: { type: 'number' },
              fields: { type: 'array' }
            }
          }
        },
        required: ['channel_id', 'content']
      }
    },
    {
      name: 'discord_get_messages',
      description: 'Üzenetek lekérése csatornáról',
      inputSchema: {
        type: 'object',
        properties: {
          channel_id: { type: 'string', description: 'Discord csatorna ID' },
          limit: { type: 'number', description: 'Maximum üzenetek száma (max 100)', default: 10 }
        },
        required: ['channel_id']
      }
    },
    {
      name: 'discord_add_reaction',
      description: 'Reakció hozzáadása üzenethez',
      inputSchema: {
        type: 'object',
        properties: {
          channel_id: { type: 'string' },
          message_id: { type: 'string' },
          emoji: { type: 'string', description: 'Emoji (pl. ✅ vagy :thumbsup:)' }
        },
        required: ['channel_id', 'message_id', 'emoji']
      }
    },
    {
      name: 'discord_list_channels',
      description: 'Szerver csatornáinak listázása',
      inputSchema: {
        type: 'object',
        properties: {
          guild_id: { type: 'string', description: 'Discord szerver ID' }
        },
        required: ['guild_id']
      }
    }
  ]
}));

// Tool végrehajtás
server.setRequestHandler('tools/call', async (request) => {
  const { name, arguments: args } = request.params;

  switch (name) {
    case 'discord_send_message': {
      const channel = await discord.channels.fetch(args.channel_id);

      const messageOptions = { content: args.content };

      if (args.embed) {
        const embed = new EmbedBuilder()
          .setTitle(args.embed.title || '')
          .setDescription(args.embed.description || '')
          .setColor(args.embed.color || 0x00A0A0);

        if (args.embed.fields) {
          embed.addFields(args.embed.fields);
        }

        messageOptions.embeds = [embed];
      }

      const sent = await channel.send(messageOptions);
      return { content: [{ type: 'text', text: `Üzenet elküldve: ${sent.id}` }] };
    }

    case 'discord_get_messages': {
      const channel = await discord.channels.fetch(args.channel_id);
      const messages = await channel.messages.fetch({ limit: args.limit || 10 });

      const formatted = messages.map(m => ({
        id: m.id,
        author: m.author.username,
        content: m.content,
        timestamp: m.createdAt.toISOString()
      }));

      return { content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }] };
    }

    case 'discord_add_reaction': {
      const channel = await discord.channels.fetch(args.channel_id);
      const message = await channel.messages.fetch(args.message_id);
      await message.react(args.emoji);
      return { content: [{ type: 'text', text: `Reakció hozzáadva: ${args.emoji}` }] };
    }

    case 'discord_list_channels': {
      const guild = await discord.guilds.fetch(args.guild_id);
      const channels = await guild.channels.fetch();

      const formatted = channels
        .filter(c => c.type === 0) // Csak text csatornák
        .map(c => ({ id: c.id, name: c.name }));

      return { content: [{ type: 'text', text: JSON.stringify(formatted, null, 2) }] };
    }

    default:
      throw new Error(`Ismeretlen tool: ${name}`);
  }
});

// === DISCORD EVENT HANDLERS ===

discord.on('ready', () => {
  console.error(`Discord bot bejelentkezve: ${discord.user.tag}`);
});

// Bejövő üzenetek figyelése (BMAD parancsokhoz)
discord.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  // BMAD parancsok: /bmad vagy !bmad prefix
  if (message.content.startsWith('/bmad') || message.content.startsWith('!bmad')) {
    const command = message.content.slice(5).trim();

    // Itt lehet továbbítani a parancsot a BMAD-nak
    // Ez a rész a konkrét implementációtól függ
    console.error(`BMAD parancs: ${command} from ${message.author.username}`);

    await message.reply(`🧙 BMAD parancs fogadva: \`${command}\`\nFeldolgozás alatt...`);
  }
});

// === STARTUP ===

async function main() {
  // Discord bejelentkezés
  await discord.login(process.env.DISCORD_BOT_TOKEN);

  // MCP Server indítás
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('Discord MCP Server elindult');
}

main().catch(console.error);
```

### 3.4 Package.json Frissítése

```json
{
  "name": "discord-mcp-server",
  "version": "1.0.0",
  "type": "module",
  "main": "server.js",
  "bin": {
    "discord-mcp": "./server.js"
  },
  "dependencies": {
    "@modelcontextprotocol/sdk": "^1.0.0",
    "discord.js": "^14.14.0",
    "dotenv": "^16.0.0"
  }
}
```

---

## 4. BMAD Konfiguráció

### 4.1 MCP Config (Claude Code)

Szerkeszd: `~/.claude/mcp.json` vagy projekt `.mcp.json`

```json
{
  "mcpServers": {
    "discord": {
      "command": "node",
      "args": ["/var/www/ceog/mcp-servers/discord/server.js"],
      "env": {
        "DISCORD_BOT_TOKEN": "MTIzNDU2Nzg5..."
      }
    }
  }
}
```

### 4.2 Környezeti Változók

Hozd létre: `mcp-servers/discord/.env`

```bash
DISCORD_BOT_TOKEN=your-bot-token-here
DISCORD_GUILD_ID=your-server-id
BMAD_CHANNEL_ID=your-bmad-channel-id
```

### 4.3 BMAD Hooks (Opcionális)

Hozd létre: `_bmad/hooks/discord-notify.yaml`

```yaml
# Discord értesítések BMAD eseményekre
hooks:
  on_workflow_start:
    - name: discord_notify_start
      action: discord_send_message
      channel_id: "${BMAD_CHANNEL_ID}"
      content: "🚀 Workflow elindult: {{workflow_name}}"

  on_workflow_complete:
    - name: discord_notify_complete
      action: discord_send_message
      channel_id: "${BMAD_CHANNEL_ID}"
      embed:
        title: "✅ Workflow befejezve"
        description: "{{workflow_name}} sikeresen lefutott"
        color: 0x059669
        fields:
          - name: "Időtartam"
            value: "{{duration}}"
          - name: "Output"
            value: "{{output_file}}"

  on_approval_needed:
    - name: discord_mention_approvers
      action: discord_send_message
      channel_id: "${BMAD_CHANNEL_ID}"
      content: "@here ⏳ Jóváhagyás szükséges: {{item_name}}"
```

---

## 5. Webhook Beállítás (Egyszerű)

Ha csak egyirányú értesítések kellenek (BMAD → Discord):

### 5.1 Webhook Létrehozása

1. Discord szerver → Csatorna beállítások → **Integrations**
2. **Webhooks** → **New Webhook**
3. Név: `BMAD Notifications`
4. Másold ki a **Webhook URL**-t

### 5.2 Webhook Használata BMAD-ból

```bash
# Egyszerű üzenet
curl -X POST "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"content": "🧙 BMAD értesítés: Workflow kész!"}'

# Embed üzenet
curl -X POST "https://discord.com/api/webhooks/YOUR_ID/YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "embeds": [{
      "title": "✅ PRD Elkészült",
      "description": "A CEO Gala 2026 PRD dokumentum elkészült.",
      "color": 383744,
      "fields": [
        {"name": "Fájl", "value": "docs/prd.md", "inline": true},
        {"name": "Szerző", "value": "BMAD PM Agent", "inline": true}
      ]
    }]
  }'
```

### 5.3 BMAD Webhook Helper Script

Hozd létre: `_bmad/scripts/discord-webhook.sh`

```bash
#!/bin/bash

WEBHOOK_URL="${DISCORD_WEBHOOK_URL}"

send_discord() {
  local message="$1"
  local title="${2:-BMAD Értesítés}"
  local color="${3:-383744}"  # Teal

  curl -s -X POST "$WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "{
      \"embeds\": [{
        \"title\": \"$title\",
        \"description\": \"$message\",
        \"color\": $color,
        \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\"
      }]
    }"
}

# Használat:
# ./discord-webhook.sh "Workflow kész!" "✅ Siker" 383744
send_discord "$1" "$2" "$3"
```

---

## 6. Parancsok és Használat

### 6.1 Discord → BMAD Parancsok

| Parancs | Leírás |
|---------|--------|
| `!bmad status` | Projekt státusz |
| `!bmad workflows` | Elérhető workflow-k |
| `!bmad run <workflow>` | Workflow indítása |
| `!bmad help` | Súgó |

### 6.2 BMAD → Discord (MCP Tools)

```
# Claude Code-ban / BMAD-ban:

"Küldj üzenetet a #bmad-notifications csatornára: Workflow kész!"
→ discord_send_message tool hívás

"Olvasd ki az utolsó 5 üzenetet a #dev csatornáról"
→ discord_get_messages tool hívás

"Adj 👍 reakciót az utolsó üzenetre"
→ discord_add_reaction tool hívás
```

---

## 7. Hibaelhárítás

### Gyakori Hibák

| Hiba | Ok | Megoldás |
|------|-----|----------|
| `Invalid Token` | Rossz bot token | Generálj új tokent |
| `Missing Access` | Bot nincs a szerveren | Hívd meg a botot |
| `Missing Permissions` | Nincs jogosultság | Ellenőrizd a bot jogokat |
| `Unknown Channel` | Rossz channel ID | Másold ki újra az ID-t |
| `Cannot send messages` | Bot nem tud írni | Adj írási jogot a csatornára |

### Debug Mód

```bash
# MCP Server futtatása debug módban
DEBUG=* node mcp-servers/discord/server.js
```

### Channel ID Megszerzése

1. Discord → Beállítások → Haladó → **Developer Mode** bekapcsolása
2. Jobb klikk a csatornára → **Copy Channel ID**

---

## Összefoglaló

| Komponens | Fájl/Helyszín |
|-----------|---------------|
| Discord Bot | Discord Developer Portal |
| MCP Server | `mcp-servers/discord/server.js` |
| MCP Config | `.mcp.json` vagy `~/.claude/mcp.json` |
| Környezeti változók | `mcp-servers/discord/.env` |
| Webhook (egyszerű) | Discord csatorna beállítások |

---

*Készítette: BMad Master 🧙*
