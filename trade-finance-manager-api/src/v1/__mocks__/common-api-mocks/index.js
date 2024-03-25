const { mockFindOneTeam } = require('./find-one-team');
const { mockFindUserById } = require('./find-user-by-id');
const { mockFindOneDeal } = require('./find-one-deal');
const { mockFindOneDealFailure } = require('./find-one-deal-failure');
const { mockUpdateDeal } = require('./update-deal');
const { mockQueryDeals } = require('./query-deals');

/*
 * This file contains common mocks for the api (api.js).
 *
 * The previous implementation to mock api calls is found in ../api.js, these are static mocks but we want to modify behaviour to test, e.g. a server error
 * or a deal not found. We should look to replace common mocks in ../api.js with jest.fn() and add implementation here.
 */

module.exports = {
  mockFindOneDeal,
  mockFindOneDealFailure,
  mockUpdateDeal,
  mockFindUserById,
  mockFindOneTeam,
  mockQueryDeals,
};
