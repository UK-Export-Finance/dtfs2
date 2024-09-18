/**
 * This typedef is kept deliberately separate from existing tfm user type defs,
 * as there is no type safety on the mock data. This means we cannot reliably assume that
 * data that should be a constant is a constant -- i.e. the teams field.
 * @typedef {object} MockTfmUser
 * @property {string} _id - The unique identifier of the user.
 * @property {string} azureOid - The Azure Object ID of the user.
 * @property {string} username - The username of the user.
 * @property {string} email - The email address of the user.
 * @property {string[]} teams - The teams the user belongs to.
 * @property {string} timezone - The timezone of the user.
 * @property {string} firstName - The first name of the user.
 * @property {string} lastName - The last name of the user.
 */

/**
 * Mock TFM Users
 * @type {MockTfmUser[]}
 */
const MOCK_USERS = [
  {
    _id: '6051d94564494924d38ce67c',
    azureOid: '6051d94564494924d38ce67c',
    username: 'BUSINESS_SUPPORT_USER_1',
    email: 'test@testing.com',
    teams: ['BUSINESS_SUPPORT'],
    timezone: 'Europe/London',
    firstName: 'John',
    lastName: 'Davies',
  },
  {
    _id: '6051d94564494924d38ce123',
    azureOid: '6051d94564494924d38ce123',
    username: 'myUsername',
    email: 'test@testing.com',
    teams: ['BUSINESS_SUPPORT'],
    timezone: 'Europe/London',
    firstName: 'Sarah',
    lastName: 'Walker',
  },
  {
    _id: '6051d94564494924d38ce124',
    azureOid: '6051d94564494924d38ce124',
    username: 'myUsername',
    email: 'test@testing.com',
    teams: ['UNDERWRITING_SUPPORT'],
    timezone: 'Europe/London',
    firstName: 'Ben',
    lastName: 'Wilson',
  },
  {
    _id: '6051d94564494924d38ce125',
    azureOid: '6051d94564494924d38ce125',
    username: 'UNDERWRITER_MANAGER_1',
    email: 'test@testing.com',
    teams: ['UNDERWRITER_MANAGERS'],
    timezone: 'Europe/London',
    firstName: 'Benjamin',
    lastName: 'Jones',
  },
  {
    _id: '6051d94564494924d38ce126',
    azureOid: '6051d94564494924d38ce126',
    username: 'UNDERWRITER_1',
    email: 'test@testing.com',
    teams: ['UNDERWRITERS'],
    timezone: 'Europe/London',
    firstName: 'Olivia',
    lastName: 'Williams',
  },
  {
    _id: '6051d94564494924d38ce127',
    azureOid: '6051d94564494924d38ce127',
    username: 'RISK_MANAGER_1',
    email: 'test@testing.com',
    teams: ['RISK_MANAGERS'],
    timezone: 'Europe/London',
    firstName: 'Steven',
    lastName: 'Robinson',
  },
];

module.exports = MOCK_USERS;
