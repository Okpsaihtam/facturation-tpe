'use strict';

const request = require('supertest');
const { createApp } = require('../src/app');
const db = require('../src/db/pool');

// Ferme le pool une seule fois, après TOUS les tests du fichier.
afterAll(() => db.close());

describe('GET /api/health', () => {
  const app = createApp();

  test('répond 200 quand le serveur et la base fonctionnent', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok', database: 'ok' });
  });

  test('répond 503 sans détail technique quand la base est injoignable', async () => {
    const spy = jest.spyOn(db, 'checkConnection').mockRejectedValueOnce(new Error('ECONNREFUSED'));
    const log = jest.spyOn(console, 'error').mockImplementation(() => {});

    const res = await request(app).get('/api/health');

    expect(res.status).toBe(503);
    expect(res.body).toEqual({ status: 'error', database: 'unreachable' });
    expect(JSON.stringify(res.body)).not.toContain('ECONNREFUSED');

    spy.mockRestore();
    log.mockRestore();
  });
});

describe('Routes API inconnues', () => {
  test('renvoient 404 en JSON', async () => {
    const res = await request(createApp()).get('/api/route-qui-n-existe-pas');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Ressource introuvable' });
  });
});

describe('Sécurité des en-têtes', () => {
  test("n'expose pas l'en-tête X-Powered-By", async () => {
    const res = await request(createApp()).get('/api/health');

    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
