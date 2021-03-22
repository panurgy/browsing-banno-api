const express = require('express');
const session = require('express-session');

const app = express();

// use the env's port, or default to a large number
const PORT = process.env.PORT || 8080;

// Session Setup
app.use(session({
  secret: 'foobar',
  resave: false,
  saveUninitialized: false,
}));

// takes any param/value settings in the query, and stores them into the session.
app.get('/', (req, res) => {
  const { query } = req;
  Object.entries(query).forEach((entry) => {
    const [key, value] = entry;
    req.session[key] = value;
  });
  req.session.now = Date.now();
  req.session.save();
  return res.send(`Session Set: ${JSON.stringify(req.session, null, 2)}`);
});

// displays everything in the user's session
app.get('/session', (req, res) => {
  res.send(`Here's the session stuff: ${JSON.stringify(req.session, null, 2)}`);
});

app.listen(PORT, (error) => {
  if (error) throw error;
  // eslint-disable-next-line no-console
  console.log('Server created Successfully on PORT :', PORT);
});
