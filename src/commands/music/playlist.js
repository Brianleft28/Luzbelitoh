import { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export const isSlashCommand = true;

export const data = new SlashCommandBuilder()
  .setName('playlist')
  .setDescription('Administra tu lista de reproducción de la manera más piola.');

export const execute = async (interaction) => {
  try {
    const user = interaction.user.username;
    console.log(`User: ${user}`);

    // Crear botones
    const row = new ActionRowBuilder()
      .addComponents(
        new ButtonBuilder()
          .setCustomId('create_playlist')
          .setLabel('Crear Playlist')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('view_playlist')
          .setLabel('Ver Playlist')
          .setStyle(ButtonStyle.Secondary),
        new ButtonBuilder()
          .setCustomId('delete_playlist')
          .setLabel('Eliminar Playlist')
          .setStyle(ButtonStyle.Danger)
      );

    await interaction.reply({ content: `${user}, selecciona una opción:`, components: [row] });
    console.log('Reply sent with buttons');
  } catch (error) {
    console.error('Error al ejecutar el comando playlist:', error);
    if (!interaction.replied && !interaction.deferred) {
      await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
    }
  }
};