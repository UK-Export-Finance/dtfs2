const { TEAMS } = require('../../constants');

const MOCK_ENTRA_USER = {
  idTokenClaims: {
    oid: '61f94a2427c1a7009cde1b9z',
    verified_primary_email: ['test@testing.com'],
    groups: [TEAMS.UNDERWRITING_SUPPORT.ssoGroupEnvVar],
    given_name: 'Sarah',
    family_name: 'Walker',
  }
};

module.exports = MOCK_ENTRA_USER;
