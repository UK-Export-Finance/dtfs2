const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/bond/change-cover-start-date', () => {
  const newDeal = aDeal({
    submissionType: 'Automatic Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    submissionDetails: {
      supplyContractCurrency: {
        id: 'GBP',
      },
    },
  });

  let noRoles;
  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let dealId;
  let bondId;

  const mockCoverStartDate = moment().subtract(1, 'month');

  const mockBond = {
    facilityStage: 'Issued',
    hasBeenIssued: true,
    'requestedCoverStartDate-day': moment(mockCoverStartDate).format('DD'),
    'requestedCoverStartDate-month': moment(mockCoverStartDate).format('MM'),
    'requestedCoverStartDate-year': moment(mockCoverStartDate).format('YYYY'),
  };

  const updateBond = async (bssDealId, bssBondId, body) => {
    const result = await as(aBarclaysMaker).put(body).to(`/v1/deals/${bssDealId}/bond/${bssBondId}`);
    return result.body;
  };

  const updateBondCoverStartDate = async (bssDealId, bssBondId, bond) => {
    const response = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${bssDealId}/bond/${bssBondId}/change-cover-start-date`);
    return response;
  };

  const createDealAndBond = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
    dealId = deal.body._id;

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    const { bondId: _id } = createBondResponse.body;

    bondId = _id;

    const getCreatedBond = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

    const modifiedBond = {
      ...getCreatedBond.body.bond,
      ...mockBond,
    };

    const updatedBond = await updateBond(dealId, bondId, modifiedBond);
    return updatedBond.body;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);

    noRoles = testUsers().withoutAnyRoles().one();
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
    await createDealAndBond();
  });

  describe('GET /v1/deals/:id/bond/:id/change-cover-start-date', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as({}).put({}).to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(noRoles).put({}).to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const deal = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id;

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(aBarclaysMaker).put({}).to('/v1/deals/620a1aa095a618b12da38c7b/bond/620a1aa095a618b12da38c7b/change-cover-start-date');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id;

      const { status } = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b/change-cover-start-date`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/bond/${bondId}/change-cover-start-date`);

      expect(status).toEqual(200);
    });

    describe('when bond.facilityStage is not `Issued`', () => {
      it('should return 400', async () => {
        const unissuedBondBody = {
          facilityStage: 'Unissued',
          hasBeenIssued: false,
        };
        const body = await updateBond(dealId, bondId, unissuedBondBody);

        const { status } = await updateBondCoverStartDate(dealId, bondId, body);
        expect(status).toEqual(400);
      });
    });

    describe('when requestedCoverStartDate is invalid', () => {
      const invalidCoverStartDate = () => {
        const date = moment().add(4, 'month');
        return {
          'requestedCoverStartDate-day': moment(date).format('DD'),
          'requestedCoverStartDate-month': moment(date).format('MM'),
          'requestedCoverStartDate-year': moment(date).format('YYYY'),
        };
      };

      it('should return 400 with the invalid date', async () => {
        const invalidRequestedCoverStartDate = invalidCoverStartDate();

        const updateCoverStartDateBody = {
          ...invalidRequestedCoverStartDate,
        };

        const { body, status } = await updateBondCoverStartDate(dealId, bondId, updateCoverStartDateBody);
        expect(status).toEqual(400);
        expect(body.bond['requestedCoverStartDate-day']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-day']);
        expect(body.bond['requestedCoverStartDate-month']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-month']);
        expect(body.bond['requestedCoverStartDate-year']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-year']);
      });

      it('should NOT update the bond', async () => {
        const invalidRequestedCoverStartDate = invalidCoverStartDate();

        const updateCoverStartDateBody = {
          ...invalidRequestedCoverStartDate,
        };

        await updateBondCoverStartDate(dealId, bondId, updateCoverStartDateBody);

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(body.bond['requestedCoverStartDate-day']).toEqual(mockBond['requestedCoverStartDate-day']);
        expect(body.bond['requestedCoverStartDate-month']).toEqual(mockBond['requestedCoverStartDate-month']);
        expect(body.bond['requestedCoverStartDate-year']).toEqual(mockBond['requestedCoverStartDate-year']);
      });
    });

    describe('with a valid requestedCoverStartDate', () => {
      const date = moment();
      const validRequestedCoverStartDate = {
        'requestedCoverStartDate-day': moment(date).format('DD'),
        'requestedCoverStartDate-month': moment(date).format('MM'),
        'requestedCoverStartDate-year': moment(date).format('YYYY'),
      };
      const updateCoverStartDateBody = {
        ...validRequestedCoverStartDate,
      };

      it('should return 200 with the new date', async () => {
        await updateBondCoverStartDate(dealId, bondId, updateCoverStartDateBody);

        const { status, body } = await as(aSuperuser).get(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);
        expect(body.bond['requestedCoverStartDate-day']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-day']);
        expect(body.bond['requestedCoverStartDate-month']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-month']);
        expect(body.bond['requestedCoverStartDate-year']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-year']);
      });

      it('should update the bond', async () => {
        await updateBondCoverStartDate(dealId, bondId, updateCoverStartDateBody);

        await as(aSuperuser).get(`/v1/deals/${dealId}/bond/${bondId}`);

        const { body } = await as(aSuperuser).get(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(body.bond['requestedCoverStartDate-day']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-day']);
        expect(body.bond['requestedCoverStartDate-month']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-month']);
        expect(body.bond['requestedCoverStartDate-year']).toEqual(updateCoverStartDateBody['requestedCoverStartDate-year']);
      });
    });
  });
});
