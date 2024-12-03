const { ObjectId } = require('mongodb');
const { generatePortalAuditDetails } = require('@ukef/dtfs2-common/change-stream');
const { generateParsedMockAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { MONGO_DB_COLLECTIONS, FACILITY_TYPE, CURRENCY } = require('@ukef/dtfs2-common');
const wipeDB = require('../../wipeDB');
const { FACILITIES } = require('../../../src/constants');
const { withValidateAuditDetailsTests } = require('../../helpers/with-validate-audit-details.api-tests');

const { testApi } = require('../../test-api');

const { APPLICATION } = require('../../mocks/gef/gef-applications');

const baseUrl = '/v1/portal/gef/facilities';
const applicationBaseUrl = '/v1/portal/gef/deals';

const createDeal = async () => {
  const { body } = await testApi.post(APPLICATION[0]).to(applicationBaseUrl);
  return body;
};

describe('PUT updateGefFacilities', () => {
  let aDeal;
  let aValidFacilityId;
  let auditDetails;

  const aValidFacilityUpdate = {
    hasBeenIssued: false,
    name: 'Test',
    type: 'Cash',
    currency: { id: CURRENCY.GBP },
  };

  beforeEach(async () => {
    await wipeDB.wipe([MONGO_DB_COLLECTIONS.FACILITIES, MONGO_DB_COLLECTIONS.DEALS]);
    aDeal = await createDeal();

    ({
      body: { _id: aValidFacilityId },
    } = await testApi.post({ dealId: aDeal._id, type: FACILITY_TYPE.CASH, hasBeenIssued: false }).to(baseUrl));

    auditDetails = generatePortalAuditDetails(new ObjectId());
  });

  withValidateAuditDetailsTests({
    makeRequest: (auditDetailsToUse) => {
      return testApi
        .put({
          facilityUpdate: aValidFacilityUpdate,
          auditDetails: auditDetailsToUse,
        })
        .to(`${baseUrl}/${aValidFacilityId}`);
    },
  });

  it('returns a 404 if the facility does not exist', async () => {
    const aValidButNonExistantFacilityId = new ObjectId();
    const { status } = await testApi.put({ facilityUpdate: aValidFacilityUpdate, auditDetails }).to(`${baseUrl}/${aValidButNonExistantFacilityId}`);

    expect(status).toEqual(404);
  });

  it('returns a 400 if the facility id is invalid', async () => {
    const anInvalidFacilityId = 'aaaa';
    const { status } = await testApi.put({ facilityUpdate: aValidFacilityUpdate, auditDetails }).to(`${baseUrl}/${anInvalidFacilityId}`);

    expect(status).toEqual(400);
  });

  it('updates a facility', async () => {
    const { status, body } = await testApi.put({ facilityUpdate: aValidFacilityUpdate, auditDetails }).to(`${baseUrl}/${aValidFacilityId}`);

    const expected = {
      hasBeenIssued: false,
      name: 'Test',
      currency: { id: CURRENCY.GBP },
      dealId: aDeal._id,
      _id: aValidFacilityId,
    };

    expect(body.value).toEqual(expect.objectContaining(expected));
    expect(status).toEqual(200);
  });

  it('fully update a facility ', async () => {
    const facilityUpdate = {
      hasBeenIssued: true,
      name: 'test',
      shouldCoverStartOnSubmission: true,
      coverStartDate: null,
      coverEndDate: '2015-01-01T00:00:00.000Z',
      monthsOfCover: 12,
      details: ['test'],
      detailsOther: null,
      currency: { id: CURRENCY.GBP },
      value: '10000000',
      coverPercentage: 80,
      interestPercentage: 40,
      paymentType: 'Monthly',
      feeType: FACILITIES.FACILITY_PAYMENT_TYPE.IN_ADVANCE,
      feeFrequency: 'Monthly',
      dayCountBasis: 365,
      coverDateConfirmed: true,
      ukefFacilityId: 1234,
      type: 'Cash',
    };

    const { status, body } = await testApi.put({ facilityUpdate, auditDetails }).to(`${baseUrl}/${aValidFacilityId}`);

    const expected = {
      hasBeenIssued: true,
      name: 'test',
      currency: { id: CURRENCY.GBP },
      dealId: aDeal._id,
      _id: aValidFacilityId,
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
      feeType: FACILITIES.FACILITY_PAYMENT_TYPE.IN_ADVANCE,
      feeFrequency: 'Monthly',
      dayCountBasis: 365,
      coverDateConfirmed: true,
      ukefFacilityId: 1234,
      type: 'Cash',
      auditRecord: generateParsedMockAuditDatabaseRecord(auditDetails),
    };

    expect(body.value).toEqual(expect.objectContaining(expected));
    expect(status).toEqual(200);
  });
});
