import {REST, Routes} from 'discord.js';
import 'dotenv/config';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'node:url';



const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_TOKEN;

const commands = [];


// Definir __filename y __dirname manualmente
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Función para cargar comandos recursivamente
const loadCommands = async (dir) => {
    const files = fs.readdirSync(dir);
  
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.lstatSync(filePath);
  
      if (stat.isDirectory()) {
        await loadCommands(filePath);
      } else if (file.endsWith('.js')) {
        console.log(`Processing file: ${filePath}`);
        const command = await import(pathToFileURL(filePath).href);
        if (command.isSlashCommand !== true) {
          console.log(`Skipping file: ${filePath} (isSlashCommand is not true)`);
          continue;
        }
        if ('data' in command && 'execute' in command) {
          console.log(`Loading command: ${filePath}`);
          commands.push(command.data.toJSON());
        } else {
          console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
      }
    }
  };
  
// Cargar todos los comandos desde el directorio 'commands'
const commandsPath = path.join(__dirname, 'commands');

await loadCommands(commandsPath);


// Construir y preparar una instancia del módulo REST
const rest = new REST().setToken(token);


// ¡Y desplegar tus comandos!
(async () => {
    try {
      console.log(`Started refreshing ${commands.length} application (/) commands.`);
  
      // El método put se utiliza para actualizar completamente todos los comandos en el gremio con el conjunto actual
      const data = await rest.put(
        Routes.applicationGuildCommands(clientId, guildId),
        { body: commands },
      );
  
      console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
      // Y por supuesto, asegúrate de capturar y registrar cualquier error
      console.error(error);
    }
  })();
  

