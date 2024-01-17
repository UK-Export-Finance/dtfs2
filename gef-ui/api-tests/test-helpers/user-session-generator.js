const crypto = require('crypto');
const signature = require('cookie-signature');
const { getUserWithRoles } = require('./user-generator');

const generateUserSession = (roles) => {
  const sessionId = crypto.randomBytes(8).toString('hex');
  const sessionCookie = `s:${signature.sign(sessionId, process.env.SESSION_SECRET)}`;
  const sessionKey = `sess:${sessionId}`;
  const user = getUserWithRoles(roles);

  const data = {
    cookie: {
      originalMaxAge: 604800000,
      expires: '2023-09-15T15:49:16.345Z',
      secure: false,
      httpOnly: true,
      path: '/',
      sameSite: 'strict',
    },
    userToken: 'mock token',
    user,
    dashboardFilters: { keyword: null },
    flash: {},
    sortBy: { order: 'updatedAt' },
    EX: 604800,
  };
  return { sessionKey, sessionCookie, data };
};

module.exports = { generateUserSession };
