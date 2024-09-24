export const name = 'ready';
export const once = true;

export const execute = (client) => {
  console.log(`Logged in as ${client.user.tag}!`);
};

