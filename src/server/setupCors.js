// START: setupCors function
/**
 * Setup CORS middleware for Express app.
 *
 * Origins are restricted via the CORS_ALLOWED_ORIGINS env var
 * (comma-separated list). Defaults to '*' when unset (dev convenience).
 */
export function setupCors(app) {
  const configured = (process.env.CORS_ALLOWED_ORIGINS || '*')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowAll = configured.includes('*');
  const allowlist = new Set(configured);

  app.use((req, res, next) => {
    const origin = req.headers.origin;

    if (allowAll) {
      res.header('Access-Control-Allow-Origin', '*');
    } else if (origin && allowlist.has(origin)) {
      res.header('Access-Control-Allow-Origin', origin);
      res.header('Vary', 'Origin');
    }

    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });
}
// END: setupCors function