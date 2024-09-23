export const execute = (message, args) => {
   if (args.length === 0) {
    return message.reply("Por favor, proporciona un nombre para saludar.");
   }

   const name = args[0]

    message.reply(`Hola, ${name}! Espero que hoy te encuentres re cheto.`);
  };