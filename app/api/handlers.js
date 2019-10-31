const querystring = require('querystring');
const Csrf = require('csrf');
const axios = require('axios');

const auth = require('../api/auth');
const database = require('../api/database');

const csrf = new Csrf();
const sentCsrfTokens = new Set();
const adminConfigNames = ['emailDomain'];
const domainRegexPattern = new RegExp('(^https?://[^/]+).*');
const googleRedirectUri = `${process.env.HOST}/auth-redirect`;

async function getMe(req, res) {
  const { email } = req.session;
  const me = await database.getUserByEmail(email);
  return res.json({ me });
}

async function logOut(req, res) {
  req.session.destroy(() => {
    res.sendStatus(200);
  });
}

async function getUsers(req, res) {
  const users = await database.getUsers();
  return res.json({ users });
}

async function deleteUser(req, res) {
  const { userId } = req.params;
  await database.deleteLinksByCreator(userId);
  await database.deleteUserById(userId);
  return res.sendStatus(200);
}

async function updateUserStatus(req, res) {
  if (!(await auth.hasStatus(req, 'admin'))) {
    return res.sendStatus(401);
  }
  const { userId, status } = req.body;
  const ALLOWED_STATUS = ['admin', 'member'];
  if (!ALLOWED_STATUS.includes(status)) {
    return res.sendStatus(400);
  }
  await database.updateUserStatus(userId, status);
  return res.sendStatus(200);
}

async function getPluginInfo(req, res) {
  const chromePluginUrl = process.env.CHROME_PLUGIN_URL;
  const { email } = req.session;
  const user = await database.getUserByEmail(email);
  const pluginInfo = {
    host: getHostDomain(req),
    email,
    key: user.plugin_key,
  };
  const pluginMagicKey = Buffer.from(JSON.stringify(pluginInfo)).toString(
    'base64',
  ); // base64 encode
  return res.json({ chromePluginUrl, pluginMagicKey });
}

async function redirectAlias(req, res) {
  const { query, email, key } = req.query;
  const [alias, ...tokenValues] = decodeURIComponent(query).split('/');
  if (!alias) {
    return res.sendStatus(400);
  }
  if (!(await database.isVerifiedUser(email, key))) {
    return res.sendStatus(404);
  }
  const link = await database.getLinkByAlias(alias);
  if (!link) {
    return res.sendStatus(404);
  }
  await database.incrementAliasCount(alias);
  const rawTarget = link.target;
  const hydratedTarget = hydrateLink(rawTarget, tokenValues);
  return res.json({ redirectUrl: hydratedTarget });
}

async function getLinks(req, res) {
  const links = await database.getLinks();
  const userIds = Array.from(new Set(links.map(l => l.creator_id)));
  const users = await database.getUsersByIds(userIds);
  const usersById = users.reduce(
    (map, user) => ({ ...map, [user.id]: user }),
    {},
  );
  const enrichedLinks = links.map(link => ({
    alias: link.alias,
    target: link.target,
    count: link.count,
    creator: usersById[link.creator_id],
  }));
  return res.json({ links: enrichedLinks });
}

async function createLink(req, res) {
  const { alias, target } = req.body;
  if (!alias || !target) {
    return res.status(400);
  }
  const link = await database.getLinkByAlias(alias);
  if (link) {
    return res.status(409).json({ error: 'Alias is taken.' });
  }
  const { email } = req.session;
  const user = await database.getUserByEmail(email);
  await database.createLink(alias, target, user.id);
  return res.sendStatus(200);
}

async function deleteLink(req, res) {
  const { alias } = req.body;
  if (alias) {
    const { email } = req.session;
    const me = await database.getUserByEmail(email);
    await database.deleteLinkByAlias(alias, me.id);
  }
  res.sendStatus(200);
}

async function startAuth(req, res) {
  // generate random CSRF token
  const csrfSecret = await csrf.secret();
  const csrfToken = csrf.create(csrfSecret);
  sentCsrfTokens.add(csrfToken);

  const queryParams = {
    scope: [
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' '),
    access_type: 'offline',
    include_granted_scopes: true,
    state: csrfToken,
    redirect_uri: googleRedirectUri,
    response_type: 'code',
    client_id: process.env.GOOGLE_API_CLIENT_ID,
  };
  const url = `https://accounts.google.com/o/oauth2/v2/auth?${querystring.stringify(
    queryParams,
  )}`;
  res.redirect(url);
}

async function redirectAuth(req, res) {
  const { state, code } = req.query;
  // verify the response is not fake, and the user authorize the permission
  if (!sentCsrfTokens.has(state) || !code) {
    return res.sendStatus(401);
  }
  sentCsrfTokens.delete(state);

  // fetch user profile data
  const { firstName, lastName, email } = await getUserGoogleProfile(code);

  // create user record if necessary
  const user = await database.getUserByEmail(email);
  if (!user) {
    const emailDomain = await database.getConfig('emailDomain');
    const isAutoApproved = emailDomain && email.endsWith(emailDomain);
    await database.createUser(email, firstName, lastName, isAutoApproved);
  }

  // persist session to database
  const { session } = req;
  session.email = email;
  session.save(() => {
    res.redirect('/?onboarding=true');
  });
}

async function getConfigs(req, res) {
  const configs = {};
  for (const name of adminConfigNames) {
    const value = await database.getConfig(name);
    if (value) {
      configs[name] = value;
    }
  }
  return res.json({ configs });
}

async function updateConfigs(req, res) {
  for (const name of adminConfigNames) {
    if (req.body[name]) {
      await database.upsertConfig(name, req.body[name]);
    }
  }
  return res.sendStatus(200);
}

async function getUserGoogleProfile(authCode) {
  const response = await axios.post(
    'https://www.googleapis.com/oauth2/v4/token',
    {
      code: authCode,
      scope: 'email',
      client_id: process.env.GOOGLE_API_CLIENT_ID,
      client_secret: process.env.GOOGLE_API_SECRET,
      redirect_uri: googleRedirectUri,
      grant_type: 'authorization_code',
    },
  );
  const { access_token } = response.data;
  const queryParams = {
    personFields: ['names', 'emailAddresses'].join(','),
    key: process.env.GOOGLE_API_KEY,
  };
  const profileResponse = await axios.get(
    `https://people.googleapis.com/v1/people/me?${querystring.stringify(
      queryParams,
    )}`,
    { headers: { Authorization: `Bearer ${access_token}` } },
  );
  const { names, emailAddresses } = profileResponse.data;
  const primaryName = names.find(name => name.metadata.primary);
  const primaryEmail = emailAddresses.find(email => email.metadata.primary);
  return {
    firstName: primaryName.givenName,
    lastName: primaryName.familyName,
    email: primaryEmail.value,
  };
}

function hydrateLink(rawTarget, tokenValues) {
  const tokens = rawTarget.match(/\{[^}]+\}/g);
  if (!tokens) {
    return rawTarget;
  }
  return hydrateToken(rawTarget, tokens, tokenValues);
}

function hydrateToken(target, tokens, values) {
  if (!tokens.length) {
    return target;
  }
  const [token, ...tokenTail] = tokens;
  const tokenIndex = parseInt(token.slice(1, -1)); // remove the enclosing '{' and '}', then convert to number
  const value =
    Number.isNaN(tokenIndex) || !values[tokenIndex] ? '' : values[tokenIndex];
  const hydratedTarget = target.replace(token, value).replace('//', '/');
  return hydrateToken(hydratedTarget, tokenTail, values);
}

function getHostDomain(req) {
  const { referer } = req.headers;
  const match = referer.match(domainRegexPattern);
  return match[1];
}

module.exports = {
  getMe,
  logOut,
  getUsers,
  deleteUser,
  updateUserStatus,
  getPluginInfo,
  redirectAlias,
  getLinks,
  createLink,
  deleteLink,
  startAuth,
  redirectAuth,
  getConfigs,
  updateConfigs,
};
