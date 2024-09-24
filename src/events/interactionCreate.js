export const name = 'interactionCreate';

export const execute = async (interaction) => {
  if (interaction.isButton()) {
    const { customId } = interaction;

    if (customId === 'create_playlist') {
      await interaction.reply('Lista de reproducción creada.');
    } else if (customId === 'view_playlist') {
      await interaction.reply('Aquí está tu lista de reproducción.');
    } else if (customId === 'delete_playlist') {
      await interaction.reply('Lista de reproducción eliminada.');
    }
  } else if (interaction.isCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) return;

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (!interaction.replied) {
        await interaction.reply({ content: 'Hubo un error al ejecutar el comando.', ephemeral: true });
      }
    }
  }
};