/*
 * This file contains common mocks for the api (api.js).
 *
 * The previous implementation to mock api calls is found in ../api.js, these are static mocks but we want to modify behaviour to test, e.g. a server error
 * or a deal not found. We should look to replace common mocks in ../api.js with jest.fn() and add implementation here.
 */

export * from './find-one-team';
export * from './find-user-by-id';
export * from './find-one-deal';
export * from './find-one-deal-failure';
export * from './update-deal';
export * from './query-deals';
