const crypto = require('crypto');
const signature = require('cookie-signature');
const { PORTAL_LOGIN_STATUS } = require('@ukef/dtfs2-common');
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
    loginStatus: PORTAL_LOGIN_STATUS.VALID_2FA,
    dashboardFilters: { keyword: null },
    flash: {},
    sortBy: { order: 'updatedAt' },
    EX: 604800,
  };
  return { sessionKey, sessionCookie, data };
};

module.exports = { generateUserSession };
