require('dotenv').config();

const SSO = {
  AUTHORITY: process.env.AZURE_SSO_AUTHORITY,
  REDIRECT_COUNTER: {
    MAX_REDIRECTS: 5,
    TIME_PERIOD: 60000,
    COOKIE_NAME: 'ssoRedirectNo',
  },
};

module.exports = SSO;
