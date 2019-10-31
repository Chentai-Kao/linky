const dotenv = require('dotenv');
dotenv.config(); // this goes as early as possible to set up environment variables

const express = require('express');
const next = require('next');
const cors = require('cors');
const bodyParser = require('body-parser');

const middleware = require('./middleware');
const handlers = require('./handlers');
const auth = require('./auth');
const database = require('./database');

main();

async function main() {
  const isProduction = process.env.NODE_ENV === 'production';

  // Next.js init
  const nextApp = next({ dev: !isProduction });
  await nextApp.prepare();

  // Postgres database init
  await database.init();

  // Express.js init
  const server = express();

  // Express middleware
  server.use(bodyParser.json()); // support JSON-encoded bodies
  server.use(cors()); // enable CORS for all origins
  server.use(middleware.session(database));
  if (isProduction) {
    server.use(middleware.forceSsl); // redirect http -> https on production
  }

  // Express routers
  server.get('/redirect', handlers.redirectAlias);
  server.get('/auth-start', handlers.startAuth);
  server.get('/auth-redirect', handlers.redirectAuth);

  server.get('/api/me', auth.loggedIn, handlers.getMe);
  server.post('/api/logout', auth.loggedIn, handlers.logOut);

  server.get('/api/users', auth.member, handlers.getUsers);
  server.get('/api/plugin-info', auth.member, handlers.getPluginInfo);
  server.get('/api/links', auth.member, handlers.getLinks);
  server.post('/api/links', auth.member, handlers.createLink);
  server.delete('/api/links', auth.member, handlers.deleteLink);

  server.put('/api/users', auth.admin, handlers.updateUserStatus);
  server.delete('/api/users/:userId', auth.admin, handlers.deleteUser);
  server.get('/api/configs', auth.admin, handlers.getConfigs);
  server.put('/api/configs', auth.admin, handlers.updateConfigs);

  // Next.js frontend router
  server.get('*', auth.appAuth, nextApp.getRequestHandler());

  // start server
  const port = process.env.PORT;
  server.listen(port, error => {
    if (error) {
      throw error;
    }
    console.log(`Server ready on http://localhost:${port}`);
  });
}
