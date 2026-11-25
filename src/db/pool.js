'use strict';

const { Pool } = require('pg');
const config = require('../config/env');

/**
 * Un « pool » garde quelques connexions PostgreSQL ouvertes et les réutilise.
 * Ouvrir une connexion à chaque requête HTTP serait lent.
 * Il doit exister UNE SEULE instance de pool dans toute l'application.
 */
const pool = new Pool({
  connectionString: config.databaseUrl,
  // Certaines bases hébergées imposent SSL. Activé via DATABASE_SSL=true (revu au ticket DEPLOY-01).
  ssl: config.databaseSsl ? { rejectUnauthorized: true } : false,
});

// Une connexion inactive qui tombe ne doit pas faire planter le serveur sans trace.
pool.on('error', (err) => {
  console.error('Erreur inattendue sur une connexion PostgreSQL inactive', err);
});

/**
 * Exécute une requête paramétrée.
 * Toujours passer les valeurs dans `params` ($1, $2…), JAMAIS par concaténation :
 * c'est ce qui protège contre l'injection SQL.
 */
function query(text, params) {
  return pool.query(text, params);
}

/** Vérifie que la base répond. */
async function checkConnection() {
  await pool.query('SELECT 1');
}

/** Ferme proprement toutes les connexions (arrêt du serveur, fin des tests). */
function close() {
  return pool.end();
}

module.exports = { pool, query, checkConnection, close };
