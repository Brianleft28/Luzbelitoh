import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import { config } from '../../config/config.js';

export const isSlashCommand = true;

export const data = new SlashCommandBuilder()
  .setName('checkusers')
  .setDescription('Verifica si los usuarios existen en la base de datos.')
  .addAttachmentOption(option => 
    option.setName('file')
      .setDescription('Archivo JSON con la lista de usuarios')
      .setRequired(true)
  );

/* Url de la api y timeout */
const apiUrl = config.api.url;
const timeout = config.timeout;

console.log('apiUrl', apiUrl);
console.log('timeout', timeout);

/* Función para verificar si un usuario existe en la base de datos */
async function checkUserExists(legajo, password) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ legajo, password }),
      timeout
    });
    console.log(`Respuesta de la API para ${legajo}:`, response.status);
    return response.status === 200;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      console.log(`Usuario ${legajo} no encontrado (404).`);
      return false;
    } else if (error.code === 'ENOTFOUND') {
      console.error(`Error de conexión al verificar el usuario ${legajo}:`, error.message);
      return null;
    } else {
      console.error(`Error al verificar el usuario ${legajo}:`, error.message);
      return null;
    }
  }
}

/* Función principal para verificar todos los usuarios */
async function verifyUsers(users, interaction) {
  for (const user of users) {
    const exists = await checkUserExists(user.legajo, user.password);
    let message;
    if (exists === null) {
      message = `No se pudo verificar el usuario ${user.legajo} debido a un error de conexión.`;
    } else if (exists) {
      message = `El usuario ${user.legajo} existe en la base de datos.`;
    } else {
      message = `El usuario ${user.legajo} no existe en la base de datos.`;
    }
    console.log(message);
    await interaction.followUp({ content: message, ephemeral: false });
  }
}

export const execute = async (interaction) => {
    try {
      const file = interaction.options.getAttachment('file');
      if (!file) {
        await interaction.reply({ content: 'Por favor, adjunta un archivo JSON con la lista de usuarios.', ephemeral: true });
        return;
      }
  
      console.log('Archivo adjunto recibido:', file.name);
  
      // Leer el archivo adjunto
      const fileBuffer = await file.attachment.arrayBuffer();
      const users = JSON.parse(Buffer.from(fileBuffer).toString('utf-8'));
      console.log('Usuarios:', users);
  
      await interaction.reply({ content: 'Iniciando verificación de usuarios...', ephemeral: true });
  
      await verifyUsers(users, interaction);
    } catch (error) {
      console.error('Error al verificar los usuarios:', error);
      await interaction.followUp({ content: 'Hubo un error al verificar los usuarios.', ephemeral: true });
    }
  };