const ExpressSession = require('express-session');
const ConnectPgSimple = require('connect-pg-simple');

function session(database) {
  const PgSession = ConnectPgSimple(ExpressSession);
  return ExpressSession({
    store: new PgSession({ pgPromise: database.db }),
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET,
    resave: false,
    cookie: { maxAge: 30 * 24 * 60 * 60 * 1000 }, // 30 days
  });
}

function forceSsl(req, res, next) {
  if (req.headers['x-forwarded-proto'] !== 'https') {
    return res.redirect(`https://${req.headers.host}${req.url}`);
  }
  return next();
}

module.exports = {
  session,
  forceSsl,
};
