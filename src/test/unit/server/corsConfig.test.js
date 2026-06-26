import { expect } from 'chai';
import express from 'express';
import axios from 'axios';
import { setupCors } from '../../../server/setupCors.js';

/**
 * Build an Express app with CORS configured for the given env value.
 * Temporarily sets CORS_ALLOWED_ORIGINS during app construction.
 */
function buildCorsApp(envValue) {
  const previous = process.env.CORS_ALLOWED_ORIGINS;

  if (envValue === undefined) {
    delete process.env.CORS_ALLOWED_ORIGINS;
  } else {
    process.env.CORS_ALLOWED_ORIGINS = envValue;
  }

  const app = express();
  setupCors(app);
  app.get('/test', (req, res) => res.json({ ok: true }));

  // Restore previous value
  if (previous === undefined) {
    delete process.env.CORS_ALLOWED_ORIGINS;
  } else {
    process.env.CORS_ALLOWED_ORIGINS = previous;
  }

  return app;
}

/**
 * Start an app on an ephemeral port; return { baseUrl, close }.
 */
function startServer(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      resolve({
        baseUrl: `http://localhost:${server.address().port}`,
        close: (done) => server.close(done)
      });
    });
  });
}

describe('setupCors middleware', () => {

  describe('when CORS_ALLOWED_ORIGINS is not set (defaults to *)', () => {
    let srv;

    before(async () => {
      srv = await startServer(buildCorsApp(undefined));
    });

    after((done) => srv.close(done));

    it('should set Access-Control-Allow-Origin: * regardless of request origin', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://example.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.equal('*');
    });

    it('should set Access-Control-Allow-Origin: * when no origin header is sent', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`);
      expect(res.headers['access-control-allow-origin']).to.equal('*');
    });
  });

  describe('when CORS_ALLOWED_ORIGINS is explicitly *', () => {
    let srv;

    before(async () => {
      srv = await startServer(buildCorsApp('*'));
    });

    after((done) => srv.close(done));

    it('should set Access-Control-Allow-Origin: *', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://anywhere.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.equal('*');
    });
  });

  describe('when CORS_ALLOWED_ORIGINS is a specific origin', () => {
    let srv;

    before(async () => {
      srv = await startServer(buildCorsApp('https://example.com'));
    });

    after((done) => srv.close(done));

    it('should echo the allowed origin back in the header', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://example.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.equal('https://example.com');
      expect(res.headers['vary']).to.equal('Origin');
    });

    it('should not set Access-Control-Allow-Origin for an unlisted origin', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://unlisted.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.be.undefined;
    });

    it('should not set Access-Control-Allow-Origin when no origin header is sent', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`);
      expect(res.headers['access-control-allow-origin']).to.be.undefined;
    });
  });

  describe('when CORS_ALLOWED_ORIGINS is a comma-separated list', () => {
    let srv;

    before(async () => {
      srv = await startServer(buildCorsApp('https://site-a.com, https://site-b.com'));
    });

    after((done) => srv.close(done));

    it('should allow the first listed origin', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://site-a.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.equal('https://site-a.com');
    });

    it('should allow the second listed origin', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://site-b.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.equal('https://site-b.com');
    });

    it('should not allow an origin not in the list', async () => {
      const res = await axios.get(`${srv.baseUrl}/test`, {
        headers: { Origin: 'https://site-c.com' }
      });

      expect(res.headers['access-control-allow-origin']).to.be.undefined;
    });
  });
});
