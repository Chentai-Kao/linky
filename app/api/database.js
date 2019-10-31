const pgPromise = require('pg-promise');

// establish database connetion
const db = pgPromise()(`${process.env.DATABASE_URL}?ssl=true`);

async function init() {
  const usersTableName = 'users';
  const linksTableName = 'links';

  await createUsersTable(usersTableName);
  await createSessionTable();
  await createLinksTable(usersTableName, linksTableName);
  await createConfigsTable();

  console.log('Postgres database is initialized');
}

async function getUsers() {
  return db.any('SELECT * FROM users');
}

async function getUserByEmail(email) {
  return db.oneOrNone('SELECT * FROM users WHERE email = $1', [email]);
}

async function getUsersByIds(userIds) {
  return userIds.length === 0
    ? []
    : db.any('SELECT * FROM users WHERE id IN ($1:csv)', [userIds]);
}

async function deleteUserById(userId) {
  return db.none('DELETE FROM users WHERE id = $1', [userId]);
}

async function createUser(email, firstName, lastName, isAutoApproved) {
  const userCount = await countTable('users');
  const status = userCount === 0 ? 'admin' : isAutoApproved ? 'member' : 'new'; // default the first user to admin
  const pluginKey = await getUnusedPluginKey();
  return db.none(
    'INSERT INTO users(email, first_name, last_name, status, plugin_key) VALUES($1, $2, $3, $4, $5)',
    [email, firstName, lastName, status, pluginKey],
  );
}

async function isVerifiedUser(email, pluginKey) {
  const maybeUser = await getUserByEmail(email);
  return maybeUser && maybeUser.plugin_key === pluginKey;
}

async function updateUserStatus(userId, status) {
  return db.none('UPDATE users SET status = $1 WHERE id = $2', [
    status,
    userId,
  ]);
}

async function getLinkByAlias(alias) {
  return db.oneOrNone('SELECT * FROM links WHERE alias = $1', [alias]);
}

async function incrementAliasCount(alias) {
  return db.none('UPDATE links SET count = count + 1 WHERE alias = $1', [
    alias,
  ]);
}

async function getLinks() {
  return db.any('SELECT * FROM links');
}

async function createLink(alias, target, userId) {
  return db.none(
    'INSERT INTO links(alias, target, creator_id) VALUES($1, $2, $3)',
    [alias, target, userId],
  );
}

async function deleteLinkByAlias(alias, userId) {
  return db.none('DELETE FROM links WHERE alias = $1 AND creator_id = $2', [
    alias,
    userId,
  ]);
}

async function deleteLinksByCreator(userId) {
  return db.none('DELETE FROM links WHERE creator_id = $1', [userId]);
}

async function getConfig(name) {
  const record = await db.oneOrNone('SELECT * FROM configs WHERE name = $1', [
    name,
  ]);
  return record ? record.value : '';
}

async function upsertConfig(name, value) {
  const existingConfig = await db.oneOrNone(
    'SELECT * FROM configs WHERE name = $1',
    [name],
  );
  return existingConfig
    ? db.none('UPDATE configs set value = $1 WHERE name = $2', [value, name])
    : db.none('INSERT INTO configs(name, value) VALUES($1, $2)', [name, value]);
}

async function createUsersTable(tableName) {
  const hasTable = await tableExists(tableName);
  if (!hasTable) {
    const userStatusTypeName = 'user_status';
    await db.none("CREATE TYPE $1:name AS ENUM ('new', 'member', 'admin')", [
      userStatusTypeName,
    ]);
    await db.none(
      `
      CREATE TABLE $1:name (
        id SERIAL PRIMARY KEY,
        status $2:name NOT NULL,
        email TEXT UNIQUE NOT NULL,
        first_name TEXT,
        last_name TEXT,
        plugin_key TEXT UNIQUE NOT NULL
      )
    `,
      [tableName, userStatusTypeName],
    );
  }
}

async function createSessionTable() {
  const tableName = 'session';
  const hasTable = await tableExists(tableName);
  if (!hasTable) {
    await db.none(
      `
      CREATE TABLE $1:name (
        sid TEXT PRIMARY KEY,
        sess JSON NOT NULL,
        expire TIMESTAMP(6) NOT NULL
      )
    `,
      [tableName],
    );
  }
}

async function createLinksTable(usersTableName, linksTableName) {
  const hasTable = await tableExists(linksTableName);
  if (!hasTable) {
    await db.none(
      `
      CREATE TABLE $1:name (
        id SERIAL PRIMARY KEY,
        alias TEXT UNIQUE NOT NULL,
        target TEXT NOT NULL,
        count INTEGER NOT NULL DEFAULT 0,
        creator_id INTEGER NOT NULL REFERENCES $2:name(id)
      )
    `,
      [linksTableName, usersTableName],
    );
  }
}

async function createConfigsTable() {
  const configsTableName = 'configs';
  const hasTable = await tableExists(configsTableName);
  if (!hasTable) {
    await db.none(
      `
      CREATE TABLE $1:name (
        id SERIAL PRIMARY KEY,
        name TEXT UNIQUE NOT NULL,
        value TEXT NOT NULL
      )
    `,
      [configsTableName],
    );
  }
}

async function tableExists(tableName) {
  const result = await db.one("SELECT to_regclass('$1:name')", [tableName]);
  return !!result.to_regclass;
}

async function countTable(tableName) {
  const { count } = await db.one('SELECT COUNT(*) FROM $1:name', [tableName]);
  return parseInt(count, 10);
}

async function getUnusedPluginKey() {
  const length = 10;
  const pluginKey = Math.random()
    .toString(36)
    .slice(2, 2 + length);
  const hasConflict = await db.oneOrNone(
    'SELECT 1 FROM users WHERE plugin_key=$1 LIMIT(1)',
    [pluginKey],
  );
  if (hasConflict) {
    return getUnusedPluginKey(); // plugin key conflicts, re-generate
  }
  return pluginKey;
}

module.exports = {
  db,
  init,
  getUsers,
  getUserByEmail,
  getUsersByIds,
  deleteUserById,
  createUser,
  isVerifiedUser,
  updateUserStatus,
  getLinkByAlias,
  incrementAliasCount,
  getLinks,
  createLink,
  deleteLinkByAlias,
  deleteLinksByCreator,
  getConfig,
  upsertConfig,
};
