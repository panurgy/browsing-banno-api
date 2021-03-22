/**
 * Contains constants used throughout the app.
 * Also contains a few useful utils, that may eventualy
 * become refactored into another/separate file if things
 * become too unwieldy.
 */

/**
 * In production, this is a "noop" function, in a local/dev environment
 * this logs to the console.
 */
let debugToUse;
// in your env/shell, set PRODUCTION=1 and things become very quiet in the console
if (process.env.PRODUCTION) {
  // no-op function
  debugToUse = () => {};
} else {
  // eslint-disable-next-line no-console
  debugToUse = console.log;
}

/**
 * Retrieves an environment variable, or throws an error if it's
 * not present (undefined).  This is handy for vars that are absolutely
 * required for the successful usage of this software.
 * @param {string} varName - the name of the environment variable to retrieve
 */
const getEnvOrFail = (varName) => {
  if (!varName) {
    throw Error('Var name is missing or empty');
  }

  const value = process.env[varName];
  // note to self, we can't use a truthy check on value, because of the empty string
  if (typeof value !== 'string') {
    throw Error(`The env var ${varName} is not defined.
      Please check the docs, and define this variable.`);
  }

  return value;
};

module.exports = {
  DEBUG: debugToUse,
  AUTH_URL: 'https://devbank.banno-production.com/a/consumer/api/v0',
  OFFLINE_ACCESS_SCOPE: 'https://api.banno.com/consumer/auth/offline_access',
  ACCOUNTS_SCOPE: 'https://api.banno.com/consumer/auth/accounts.readonly',
  PROFILE_SCOPE: 'https://api.banno.com/consumer/auth/user.profile.readonly',
  TRANSACTIONS_DETAILS_SCOPE: 'https://api.banno.com/consumer/auth/transactions.detail.readonly',
  getEnvOrFail,
};
