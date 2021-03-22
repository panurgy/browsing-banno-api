/**
 * Returns information about the current logged-in user.
 */
const fetch = require('node-fetch');

const {
  DEBUG,
  AUTH_URL,
} = require('./constants');

const meHandler = async (req, res) => {
  const url = `${AUTH_URL}/oidc/me`;
  const headers = {
    Authorization: `Bearer ${req.session.accessToken}`,
  };
  const response = await fetch(url, { headers });
  const data = await response.json();
  req.session.sub = data.sub;
  DEBUG(response.status, data);

  res.set('Content-Type', 'application/json').send(JSON.stringify(data, null, 2));
};

module.exports = {
  meHandler,
};
