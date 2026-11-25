'use strict';

const config = require('./config/env');
const { createApp } = require('./app');

const app = createApp();

app.listen(config.port, () => {
  console.log(`Serveur démarré sur http://localhost:${config.port} (${config.env})`);
});
