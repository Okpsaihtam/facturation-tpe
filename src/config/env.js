'use strict';

/**
 * Point d'entrée UNIQUE pour la configuration.
 * Le reste du code importe `config` au lieu de lire `process.env` partout :
 * on sait ainsi en un coup d'œil quelles variables l'application utilise.
 */
require('dotenv').config({ quiet: true });

const NODE_ENV = process.env.NODE_ENV || 'development';

const config = {
  env: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isTest: NODE_ENV === 'test',
  port: Number.parseInt(process.env.PORT, 10) || 3000,
};

module.exports = config;
