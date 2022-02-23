const wipeDB = require('../../wipeDB');
const CONSTANTS = require('../../../src/constants');

const facilitiesCollectionName = 'facilities';
const dealsCollectionName = 'deals';

const app = require('../../../src/createApp');
const { as } = require('../../api')(app);

const { APPLICATION } = require('../../mocks/gef/gef-applications');

const testUserCache = require('../../mocks/test-users/api-test-users');

const baseUrl = '/v1/portal/gef/facilities';
const applicationBaseUrl = '/v1/portal/gef/deals';

const api = require('../../api')(app);

const createDeal = async () => {
  const { body } = await api.post(APPLICATION).to(applicationBaseUrl);
  return body;
};

describe('PUT updateGefFacilities', () => {
  let aMaker;
  let mockApplication;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aMaker = testUsers().withRole('maker').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe([facilitiesCollectionName]);
    await wipeDB.wipe([dealsCollectionName]);
  });

  it('returns 404 if facility does not exist', async () => {
    const { status } = await as().put({}).to(`${baseUrl}/6215fed9a216070012c365af`);
    expect(status).toEqual(404);
  });

  it('updates a facility', async () => {
    const update = {
      hasBeenIssued: false,
      name: 'Test',
      currency: { id: 'GBP' },
    };

    mockApplication = await createDeal();

    const item = await as(aMaker).post({ dealId: mockApplication._id, type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

    const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body._id}`);

    const expected = {
      hasBeenIssued: false,
      name: 'Test',
      currency: { id: 'GBP' },
      dealId: mockApplication._id,
      _id: item.body._id,
    };

    expect(body.value).toEqual(expect.objectContaining(expected));
    expect(status).toEqual(200);
  });

  it('fully update a facility ', async () => {
    const update = {
      hasBeenIssued: true,
      name: 'test',
      shouldCoverStartOnSubmission: true,
      coverStartDate: null,
      coverEndDate: '2015-01-01T00:00:00.000Z',
      monthsOfCover: 12,
      details: ['test'],
      detailsOther: null,
      currency: { id: 'GBP' },
      value: '10000000',
      coverPercentage: 80,
      interestPercentage: 40,
      paymentType: 'Monthly',
      feeType: CONSTANTS.FACILITIES.FACILITY_PAYMENT_TYPE.IN_ADVANCE,
      feeFrequency: 'Monthly',
      dayCountBasis: 365,
      coverDateConfirmed: true,
      ukefFacilityId: 1234,
    };

    mockApplication = await createDeal();

    const item = await as(aMaker).post({ dealId: mockApplication._id, type: CONSTANTS.FACILITIES.FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl);

    const { status, body } = await as(aMaker).put(update).to(`${baseUrl}/${item.body._id}`);

    const expected = {
      hasBeenIssued: true,
      name: 'test',
      currency: { id: 'GBP' },
      dealId: mockApplication._id,
      _id: item.body._id,
      shouldCoverStartOnSubmission: true,
      coverStartDate: null,
      coverEndDate: '2015-01-01T00:00:00.000Z',
      monthsOfCover: 12,
      details: ['test'],
      detailsOther: null,
      value: '10000000',
      coverPercentage: 80,
      interestPercentage: 40,
      paymentType: 'Monthly',
      feeType: CONSTANTS.FACILITIES.FACILITY_PAYMENT_TYPE.IN_ADVANCE,
      feeFrequency: 'Monthly',
      dayCountBasis: 365,
      coverDateConfirmed: true,
      ukefFacilityId: 1234,
    };

    expect(body.value).toEqual(expect.objectContaining(expected));
    expect(status).toEqual(200);
  });
});
