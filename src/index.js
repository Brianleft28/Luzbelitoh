import { Client, Events, GatewayIntentBits } from "discord.js";
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// cargar variables de entorno
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
  client.user.setActivity("con tu vieja", { type: "PLAYING" });
  client.user.setStatus("online");
  
});
// conectar cliente a nuestra aplicación de Discord
client.login(token);


const commands = new Map();

// Obtener la ruta completa del archivo actual
const __filename = fileURLToPath(import.meta.url);
// Obtener directorio actual
const __dirname = path.dirname(__filename);
console.log(__filename);
console.log(__dirname);  

// Cargar archivos de comandos
const commandFiles = fs
  .readdirSync(path.join(__dirname, "commands"))
  .filter((file) => file.endsWith(".js"));

for (const file of commandFiles) {
  const command = await import(`./commands/${file}`);
  const commandName = file.split(".")[0];
  commands.set(commandName, command);
}

// Crear evento de mensaje
client.on(Events.MessageCreate, async (message) => {
  try {
    // Verificar si el mensaje es un comando
    if (!message.content.startsWith("!") || message.author.bot) return;

    // Separar el comando y los argumentos
    const args = message.content.slice("!".length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    // Verificar si el comando existe
    if (!commands.has(command)) return;

    // Ejecutar el comando
    commands.get(command).execute(message, args);
  } catch (error) {
    console.error(error);
  }

});