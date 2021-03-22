/**
 * Returns information about the accounts for the current logged-in user.
 */
const fetch = require('node-fetch');

const {
  AUTH_URL,
} = require('./constants');

// almost retrieves the user's accounts - the problem is that
//   we don't seem to possess the user's "userId", and I couldn't
//   track down that info within Banno's API docs ...
const accountsHandler = async (req, res) => {
  const userId = req.session.sub;
  const url = `${AUTH_URL}/users/${userId}/accounts`;
  const headers = {
    Authorization: `Bearer ${req.session.accessToken}`,
  };
  const response = await fetch(url, { headers });
  if (response.status !== 200) {
    const text = await response.text();
    const msg = `Unable to get accounts, error ${response.status}: ${text}`;
    res.status(400).send(msg);
    throw Error(msg);
  } else {
    const data = await response.json();
    res.set('Content-Type', 'application/json').send(JSON.stringify(data, null, 2));
  }
};

module.exports = {
  accountsHandler,
};
