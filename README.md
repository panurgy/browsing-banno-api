# browsing-banno-api
Exploring Banno's APIs

API Docs: https://jackhenry.dev/

# Using this repo

 * clone the repo
 * run `npm install` to install the dependencies
 * run `npm start` to start the server  (if you want/need a specific listen-port, set the PORT in your shell's env before running this.)

 # Available endpoints

 * `/` = redirects to the `login` or `me` endpoint
 * `/login` = begins the login process, using the external identity/auth provider
 * `/me` = displays info about the current logged-in user
 * `/accounts` = displays basic info about the logged-in user's accounts
