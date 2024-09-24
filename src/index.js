import { Client, GatewayIntentBits, Collection, Events } from 'discord.js';
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from 'url';

// Definir __filename y __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Cargar variables de entorno
const token = process.env.DISCORD_TOKEN;

// Crear nuevo cliente de Discord
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.commands = new Collection();
// Función para cargar comandos recursivamente
const loadCommands = async (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      await loadCommands(filePath);
    } else if (file.endsWith('.js')) {
      try {
        const command = await import(pathToFileURL(filePath).href);
        const commandName = path.basename(file, '.js');
        client.commands.set(commandName, command);
        console.log(`Loaded command: ${commandName}`);
      } catch (error) {
        console.error(`Error loading command ${filePath}:`, error);
      }
    }
  }
};

// Función para cargar eventos recursivamente
const loadEvents = (dir) => {
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.lstatSync(filePath);

    if (stat.isDirectory()) {
      loadEvents(filePath);
    } else if (file.endsWith('.js')) {
      import(pathToFileURL(filePath).href).then((event) => {
        if (event.once) {
          client.once(event.name, (...args) => event.execute(...args));
        } else {
          client.on(event.name, (...args) => event.execute(...args));
        }
      });
    }
  }
};

// Cargar archivos de comandos y eventos
loadCommands(path.join(__dirname, 'commands'));
loadEvents(path.join(__dirname, 'events'));

// Conectar cliente a nuestra aplicación de Discord
client.login(token);




