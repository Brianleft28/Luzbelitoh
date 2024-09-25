import 'dotenv/config';

export const config = {
    api: {
        url: process.env.API_URL,
    },
    timeout: process.env.TIMEOUT,
}