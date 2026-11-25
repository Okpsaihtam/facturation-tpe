'use strict';

/**
 * Point d'entrée UNIQUE pour la configuration.
 * Le reste du code importe `config` au lieu de lire `process.env` partout :
 * on sait ainsi en un coup d'œil quelles variables l'application utilise.
 */
require('dotenv').config({ quiet: true });

const NODE_ENV = process.env.NODE_ENV || 'development';
const isTest = NODE_ENV === 'test';

/**
 * Lit une variable obligatoire. Si elle manque, on arrête l'application
 * immédiatement avec un message clair (« fail fast »), plutôt que de planter
 * plus tard avec une erreur incompréhensible.
 */
function required(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Variable d'environnement manquante : ${name}. ` +
        'Copiez .env.example en .env et complétez-le.',
    );
  }
  return value;
}

const config = {
  env: NODE_ENV,
  isProduction: NODE_ENV === 'production',
  isTest,
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  // Les tests utilisent une base séparée pour ne jamais toucher aux données de dev.
  databaseUrl: isTest ? required('DATABASE_URL_TEST') : required('DATABASE_URL'),
  databaseSsl: process.env.DATABASE_SSL === 'true',
};

module.exports = config;
