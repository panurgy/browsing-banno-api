/**
 * Second attempt at building an auth system. The first attempt
 * tried using the OpenID client from Passport, but ran into an
 * assortment of issues.
 *
 * This implementation follows the "command line" approach
 * https://jackhenry.dev/open-api-docs/consumer-api/quickstarts/AuthenticationCommandLine/
 */
const crypto = require('crypto');

// generates a code verifier when the app starts
const codeVerifier = crypto.randomBytes(60)
  .toString('hex').slice(0, 128);

// sha256 hash of the code verifier (created above)
const codeChallenge = crypto.createHash('sha256')
  .update(Buffer.from(codeVerifier)).digest('base64')
  .replace(/=/g, '')
  .replace(/\+/g, '-')
  .replace(/\//g, '_');

module.exports = {
  codeVerifier,
  codeChallenge,
};
