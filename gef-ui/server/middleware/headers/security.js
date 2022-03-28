/**
 * Global middleware, ensures myriads of imperative security headers.
 * - `HSTS` - 1 Year
 * - `X-Frame-Options` - Clickjacking
 * - `XSS`
 * - `X-Content-Type-Options`
 * - `CSP`
 * - `Cache-Control` - 7 days
 * - `Pragma` - HTTP/1.0 backward compatibility for `Cache-Control` HTTP/1.1 header.
 * - `Set-Cookie`
 * - `X-Download-Options`: IE8 HTML file download
 * - `Referrer-Policy`: Referrer information
 * - `X-DNS-Prefetch-Control` - Reduces latency
 * - `Expect-CT` - Certificate transparency
 * - CORP
 * - Removes `X-Powered-By`
 * @param {Object} req Request object
 * @param {Object} res Response object
 * @param {String} next Callback function name
 */
const security = (req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=15552000; includeSubDomains');
  res.setHeader('X-Frame-Options', 'deny');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Content-Type-Options', 'no-sniff');
  res.setHeader('Content-Security-Policy', "default-src 'self';base-uri 'self';block-all-mixed-content;font-src 'self' https: data:;form-action 'self';frame-ancestors 'self';img-src 'self' data:;object-src 'none';script-src 'self' 'unsafe-inline';script-src-attr 'self' 'unsafe-inline';style-src 'self' https:;upgrade-insecure-requests");
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=604800');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Referrer-Policy', 'same-origin');
  res.setHeader('X-Download-Options', 'noopen');
  res.setHeader('X-DNS-Prefetch-Control', 'on');
  res.setHeader('Expect-CT', 'max-age=0,enforce');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

  res.removeHeader('X-Powered-By');
  next();
};

module.exports = security;
