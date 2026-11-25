'use strict';

const path = require('node:path');
const express = require('express');
const healthRoutes = require('./routes/health.routes');

/**
 * Construit l'application Express SANS démarrer le serveur.
 * Séparer `app` (ici) et `listen` (server.js) permet aux tests
 * d'appeler l'API sans ouvrir de port réseau.
 */
function createApp() {
  const app = express();

  // Ne pas annoncer « Express » dans les en-têtes HTTP (info utile aux attaquants).
  app.disable('x-powered-by');

  // Lecture des corps JSON, avec une taille maximale pour éviter les abus.
  app.use(express.json({ limit: '100kb' }));

  // Front : fichiers statiques (HTML, CSS, JS vanilla).
  app.use(express.static(path.join(__dirname, '..', 'public')));

  // API
  app.use('/api/health', healthRoutes);

  // Toute route /api inconnue → 404 en JSON.
  app.use('/api', (req, res) => {
    res.status(404).json({ error: 'Ressource introuvable' });
  });

  return app;
}

module.exports = { createApp };
