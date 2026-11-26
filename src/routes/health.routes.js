'use strict';

const { Router } = require('express');

const router = Router();

/**
 * GET /api/health
 * Permet de vérifier que le serveur répond (utile aussi pour l'hébergeur).
 */
router.get('/', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router;
