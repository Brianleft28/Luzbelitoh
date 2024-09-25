export const execute = async (message, args) => {
    // Verificar si el usuario tiene permisos para gestionar roles
    if (!message.member.permissions.has("MANAGE_ROLES")) {
        return message.reply("No tenes permisos para gestionar roles.");
    }
    // Verificar si se proporcionó suficientes argumentos
    if (args.length < 2) {
        return message.reply("Por favor, proporciona un usuario y un rol.");
    }
    // Obtener el usuario y el rol
    const roleName = args[0];

    // Verificar si el usuario mencionado es válido
    const user = message.mentions.users.first();
    if (!user) {
        return message.reply("Por favor, menciona a un usuario válido.");
    }

    // Obtener el miembro del servidor
    const member = message.guild.members.cache.get(user.id);
    if (!member) {
        return message.reply(`El usuario ${user.username} no es miembro del servidor.`);
    }


    // Verificar si el rol existe
    const role = message.guild.roles.cache.find((role) => role.name === roleName);

    if (!role) {
        return message.reply(`El rol ${roleName} no existe.`);
    }  // Asignar el rol al miembro
    try {
      await member.roles.add(role);
      message.reply(`Rol ${roleName} asignado a ${user.tag}.`);
    } catch (error) {
      console.error(error);
      message.reply("Hubo un error al asignar el rol.");
    }
}