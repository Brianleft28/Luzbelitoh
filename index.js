import { Client, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";

const token = process.env.DISCORD_TOKEN;

// crear nuevo cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

// crear evento
client.on(Events.ClientReady, async () => {
  console.log(`Conectado como ${client.user.username}`);
});

// conectar cliente a nuestra aplicación de Discord
console.log("Conectando...", token);
client.login(token);

// Respuestas a mensajes

client.on(Events.MessageCreate, async (message) => {
  if (message.content === "Hola") {
    message.reply("chau puto");
  }
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith("/")) return;

  const args = message.content.slice(1);

  if (args === "ping") {
    message.reply("pong");
  }
});
