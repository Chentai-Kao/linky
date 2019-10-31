const database = require('../api/database');

const appAuthCheckers = {
  '/pending': async (req, res, next) => {
    if (!isLoggedIn(req)) {
      return res.redirect('/login');
    }
    return next();
  },
  '/': async (req, res, next) => {
    if (!isLoggedIn(req)) {
      return res.redirect('/login');
    }
    if (
      !((await hasStatus(req, 'member')) || (await hasStatus(req, 'admin')))
    ) {
      return res.redirect('/pending');
    }
    return next();
  },
};

async function appAuth(req, res, next) {
  const authChecker = appAuthCheckers[req.url];
  return authChecker ? authChecker(req, res, next) : next();
}

function loggedIn(req, res, next) {
  return isLoggedIn(req) ? next() : res.sendStatus(401);
}

async function member(req, res, next) {
  return isLoggedIn(req) &&
    ((await hasStatus(req, 'member')) || (await hasStatus(req, 'admin')))
    ? next()
    : res.sendStatus(401);
}

async function admin(req, res, next) {
  return isLoggedIn(req) && (await hasStatus(req, 'admin'))
    ? next()
    : res.sendStatus(401);
}

function isLoggedIn(req) {
  return req.session && req.session.email;
}

async function hasStatus(req, status) {
  const user = await database.getUserByEmail(req.session.email);
  return user.status === status;
}

module.exports = {
  appAuth,
  loggedIn,
  member,
  admin,
  hasStatus,
};
