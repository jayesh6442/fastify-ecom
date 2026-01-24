// src/server.ts

import { buildApp } from "./app.js";

async function start() {
    const app = buildApp();

    try {
        await app.listen({ port: 3000, host: '0.0.0.0' });
        app.log.info('Server started');
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

start();
