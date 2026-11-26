'use strict';

const { Router } = require('express');
const db = require('../db/pool');

const router = Router();

/**
 * GET /api/health
 * Indique si le serveur ET la base de données répondent.
 * Utilisé par l'hébergeur pour savoir si l'application est en bonne santé.
 */
router.get('/', async (req, res) => {
  try {
    await db.checkConnection();
    res.json({ status: 'ok', database: 'ok' });
  } catch (err) {
    console.error('Health check : base de données injoignable', err.message);
    // 503 = service indisponible. On ne renvoie pas le détail de l'erreur au client.
    res.status(503).json({ status: 'error', database: 'unreachable' });
  }
});

module.exports = router;
