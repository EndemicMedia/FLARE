/**
 * Lightweight debug logger.
 *
 * `debug` output is suppressed in production builds (only emitted when
 * `import.meta.env.DEV` is true). `warn` and `error` always pass through.
 */
const isDev = Boolean(import.meta.env?.DEV);

export const logger = {
  debug: (...args: unknown[]): void => {
    // eslint-disable-next-line no-console -- intentional dev-only debug channel
    if (isDev) console.log(...args);
  },
  warn: (...args: unknown[]): void => {
    console.warn(...args);
  },
  error: (...args: unknown[]): void => {
    console.error(...args);
  },
};
