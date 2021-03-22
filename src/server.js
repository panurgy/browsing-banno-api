const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const { URLSearchParams } = require('url');

const {
  DEBUG,
  AUTH_URL,
  getEnvOrFail,
  OFFLINE_ACCESS_SCOPE,
  ACCOUNTS_SCOPE,
  PROFILE_SCOPE,
  TRANSACTIONS_DETAILS_SCOPE,
} = require('./constants');

const {
  codeVerifier,
  codeChallenge,
} = require('./auth2');

const { meHandler } = require('./me');
const { accountsHandler } = require('./accounts');

const CLIENT_ID = getEnvOrFail('CLIENT_ID');
const CLIENT_SECRET = getEnvOrFail('CLIENT_SECRET');

// grab important info about the server that's hosting/running this, or
//    assume it's running on a local machine.
const port = process.env.PORT || 8080;
const redirectBaseURL = process.env.BASE_URL || `http://localhost:${port}`;
const authRedirectUri = `${redirectBaseURL}/auth/cb`;

// prepare all of the pieces, and put them together
const app = express();
const sessionConfig = {
  secret: 'anything goes',
  resave: true,
  saveUninitialized: true,
};
app.use(session(sessionConfig));

// starts the login process
app.get('/login', (req, res) => {
  const state = `${Date.now()}.${Math.random()}`;
  req.session.pendingState = state;
  if (req.query.returnPath && req.query.returnPath.startsWith('/')) {
    // after a successful login, redirect the user's browser to this absolute path
    req.session.pendingRedirect = req.query.returnPath;
  } else {
    // make sure there isn't a leftover pending redirect
    delete req.session.pendingRedirect;
  }

  // prepare the query params for the auth provider site
  const params = {
    client_id: CLIENT_ID,
    redirect_uri: authRedirectUri,
    scope: `openid address email phone profile ${OFFLINE_ACCESS_SCOPE} ${ACCOUNTS_SCOPE} ${PROFILE_SCOPE} ${TRANSACTIONS_DETAILS_SCOPE}`,
    response_type: 'code',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  };

  // convert the params object into a properly escaped string/url
  const paramString = Object.entries(params)
    .map((entry) => {
      const [key, value] = entry;
      return `${key}=${encodeURIComponent(value)}`;
    })
    .join('&');

  // put all the pieces together for the authorization url
  const url = `${AUTH_URL}/oidc/auth?${paramString}`;
  // and send the user's browser over to the auth site
  res.redirect(url);
});

// receives the callback/redirect after the user grants permission within the auth site
app.get('/auth/cb', async (req, res) => {
  const { code, state } = req.query;
  const { pendingState } = req.session;
  if (pendingState !== state) {
    const err = 'Unable to login, the "state" parameter is not valid.';
    res.status(400).send(err);
    throw Error(err);
  }

  // prepare these params/values in a form-encoded format
  const params = new URLSearchParams();
  params.append('client_id', CLIENT_ID);
  params.append('client_secret', CLIENT_SECRET);
  params.append('grant_type', 'authorization_code');
  params.append('code', code);
  params.append('redirect_uri', authRedirectUri);
  params.append('code_verifier', codeVerifier);

  const url = `${AUTH_URL}/oidc/token`;
  // node-fetch uses the content-type when it notices the body is form-encoded
  const response = await fetch(url, { method: 'POST', body: params });
  const data = await response.json();
  DEBUG(response.status, data);

  // save the tokens for future requests on behalf of this user
  req.session.accessToken = data.access_token;
  req.session.refreshToken = data.refresh_token;
  req.session.idToken = data.id_token;

  // res.set('Content-Type', 'application/json').send(JSON.stringify(data, null, 2));

  let { pendingRedirect } = req.session;
  if (!pendingRedirect) {
    pendingRedirect = '/me';
  }
  res.redirect(pendingRedirect);
});

// sends the user to the "login" route, or to the "me" route
app.get('/', (req, res) => {
  if (!req.session.accessToken) {
    res.redirect('/login?returnPath=/me');
    return;
  }
  res.redirect('/me');
});

// fetches and displays information about the logged in user
app.get('/me', meHandler);

// attempts to retrieve the user's accounts
app.get('/accounts', accountsHandler);

// start it all up, and listen patiently ...
app.listen(port, () => {
  DEBUG(`Example app listening on port ${port}`);
});
