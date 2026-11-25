'use strict';

const config = require('./config/env');
const db = require('./db/pool');
const { createApp } = require('./app');

async function start() {
  // On vérifie la base AVANT d'accepter des requêtes.
  await db.checkConnection();

  const app = createApp();
  const server = app.listen(config.port, () => {
    console.log(`Serveur démarré sur http://localhost:${config.port} (${config.env})`);
  });

  // Arrêt propre (Ctrl+C en local, redéploiement chez l'hébergeur).
  const shutdown = (signal) => {
    console.log(`${signal} reçu, arrêt du serveur…`);
    server.close(async () => {
      await db.close();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((err) => {
  console.error('Impossible de démarrer le serveur :', err.message);
  process.exit(1);
});
