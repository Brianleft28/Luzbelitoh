import { SlashCommandBuilder } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { google } from 'googleapis';

export const isSlashCommand = true;

export const data = new SlashCommandBuilder()
  .setName('meet')
  .setDescription('Inicia una nueva reunión de Google Meet.');

const SCOPES = ['https://www.googleapis.com/auth/calendar'];
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajustar la ruta de TOKENS_DIR para que apunte a la carpeta 'tokens'
const TOKENS_DIR = path.join(__dirname, 'tokens');

if (!fs.existsSync(TOKENS_DIR)) {
  fs.mkdirSync(TOKENS_DIR, { recursive: true });
}

export const execute = async (interaction) => {
  const userId = interaction.user.id;
  const tokenPath = path.join(TOKENS_DIR, `${userId}.json`);

  try {
    // Ajustar la ruta de credentialsPath para que apunte a la carpeta 'config'
    const credentialsPath = path.join(__dirname, 'config/credentials.json');
    const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));

    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token for this user.
    if (fs.existsSync(tokenPath)) {
      const token = fs.readFileSync(tokenPath, 'utf8');
      oAuth2Client.setCredentials(JSON.parse(token));
    } else {
      await getAccessToken(oAuth2Client, tokenPath, interaction, userId);
      return; // Salir de la función hasta que el usuario ingrese el código de autorización
    }

    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });

    // Crear un evento en Google Calendar
    const event = {
      summary: 'Reunión de Discord',
      description: 'Reunión iniciada desde Discord',
      start: {
        dateTime: new Date().toISOString(),
        timeZone: 'America/Los_Angeles',
      },
      end: {
        dateTime: new Date(new Date().getTime() + 60 * 60 * 1000).toISOString(), // 1 hora de duración
        timeZone: 'America/Los_Angeles',
      },
      conferenceData: {
        createRequest: {
          requestId: 'sample123',
          conferenceSolutionKey: {
            type: 'hangoutsMeet',
          },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      resource: event,
      conferenceDataVersion: 1,
    });

    const meetLink = response.data.hangoutLink;

    await interaction.reply(`Reunión de Google Meet creada: ${meetLink}`);
  } catch (error) {
    console.error('Error al crear la reunión de Google Meet:', error);
    await interaction.reply({ content: 'Hubo un error al crear la reunión de Google Meet.', ephemeral: true });
  }
};

async function getAccessToken(oAuth2Client, tokenPath, interaction, userId) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline', // Asegurarse de que se obtenga un token de actualización
    scope: SCOPES,
    state: userId,
  });

  await interaction.reply({ content: `Autoriza esta aplicación visitando esta URL: ${authUrl}\nLuego, responde con el código de autorización.`, ephemeral: true });

  console.log(`Autoriza esta aplicación visitando esta URL: ${authUrl}`);

  // Esperar la respuesta del usuario con el código de autorización
  const filter = response => response.author.id === userId && response.content.trim().length > 0;
  const collector = interaction.channel.createMessageCollector({ filter, time: 300000 }); // 5 minutos

  collector.on('collect', async (message) => {
    const code = message.content.trim();
    console.log(`Código de autorización recibido: ${code}`); // Agregar console.log para depuración

    try {
      const { tokens } = await oAuth2Client.getToken(code);
      console.log(`Tokens recibidos: ${JSON.stringify(tokens)}`); // Agregar console.log para depuración
      oAuth2Client.setCredentials(tokens);

      fs.writeFileSync(tokenPath, JSON.stringify(tokens));
      console.log(`Tokens guardados en: ${tokenPath}`); // Agregar console.log para depuración

      await message.reply('Autorización completada. Ahora puedes usar el comando /meet nuevamente.');
      collector.stop();
    } catch (error) {
      console.error('Error al obtener el token:', error);
      if (error.response && error.response.data && error.response.data.error === 'invalid_grant') {
        await message.reply('El código de autorización es inválido o ha expirado. Por favor, intenta nuevamente.');
      } else {
        await message.reply('Hubo un error al obtener el token. Por favor, intenta nuevamente.');
      }
    }
  });

  collector.on('end', collected => {
    if (collected.size === 0) {
      interaction.followUp({ content: 'No se recibió ningún código de autorización. Por favor, intenta nuevamente.', ephemeral: true });
    }
  });
}