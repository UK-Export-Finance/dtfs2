const { sub, format, add } = require('date-fns');
const { CURRENCY } = require('@ukef/dtfs2-common');
const databaseHelper = require('../../database-helper');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);
const CONSTANTS = require('../../../src/constants');
const { MAKER } = require('../../../src/v1/roles/roles');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('/v1/deals/:id/bond/:id/issue-facility', () => {
  const nowDate = new Date();

  const newDeal = aDeal({
    submissionType: 'Manual Inclusion Notice',
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    status: "Ready for Checker's approval",
    details: {
      submissionDate: sub(nowDate, { days: 1 }).valueOf(),
    },
    submissionDetails: {
      supplyContractCurrency: {
        id: CURRENCY.GBP,
      },
    },
    eligibility: {
      criteria: [{ id: 15, answer: true }],
    },
  });

  const createCoverDateFields = (prefix, date) => ({
    [`${prefix}-day`]: format(date, 'dd'),
    [`${prefix}-month`]: format(date, 'MM'),
    [`${prefix}-year`]: format(date, 'yyyy'),
  });

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    facilityStage: 'Unissued',
    hasBeenIssued: false,
    previousFacilityStage: 'Unissued',
    ukefGuaranteeInMonths: '24',
    bondBeneficiary: 'test',
    value: '123456.55',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '9.09',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: '365',
    status: 'Ready for check',
  };

  const issueFacilityBody = {
    ...createCoverDateFields('requestedCoverStartDate', add(nowDate, { weeks: 1 })),
    ...createCoverDateFields('coverEndDate', add(nowDate, { months: 1 })),
    ...createCoverDateFields('issuedDate', nowDate),
    name: '1234',
  };

  let aBarclaysMaker;
  let anHSBCMaker;
  let aSuperuser;
  let dealId;
  let bondId;

  const createBond = async () => {
    const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals');
    dealId = deal.body._id;

    const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    bondId = createBondResponse.body.bondId;

    const { status, body } = await as(aBarclaysMaker).put(allBondFields).to(`/v1/deals/${dealId}/bond/${bondId}`);
    expect(body.hasBeenIssued).toEqual(false);
    expect(status).toEqual(200);
  };

  const putIssueFacility = async (issueDealId, issueBondId, body) => {
    const response = await as(aBarclaysMaker).put(body).to(`/v1/deals/${issueDealId}/bond/${issueBondId}/issue-facility`);
    return response;
  };

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole(MAKER).withBankName('Barclays Bank').one();
    anHSBCMaker = testUsers().withRole(MAKER).withBankName('HSBC').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
    await createBond();
  });

  describe('PUT /v1/deals/:id/bond/:id/issue-facility', () => {
    it('should return 401 when user cannot access the deal', async () => {
      const { status } = await as(anHSBCMaker).put({}).to(`/v1/deals/${dealId}/bond/${bondId}/issue-facility`);
      expect(status).toEqual(401);
    });

    it('should return 404 when deal does not exist', async () => {
      const { status } = await putIssueFacility('620a1aa095a618b12da38c7b', bondId, {});
      expect(status).toEqual(404);
    });

    it('should return 404 when bond does not exist', async () => {
      const { status } = await putIssueFacility(dealId, '620a1aa095a618b12da38c7b', {});
      expect(status).toEqual(404);
    });

    it('should return 403 when bond cannot be issued', async () => {
      // put deal into a state that doesn't allow facility issuance
      await as(aSuperuser)
        .put({
          comments: 'test',
          status: 'Abandoned',
        })
        .to(`/v1/deals/${dealId}/status`);

      const { status } = await putIssueFacility(dealId, bondId, {});
      expect(status).toEqual(403);
    });

    it('should remove bond status and add issueFacilityDetailsStarted', async () => {
      const { body } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(body.status === allBondFields.status).toEqual(false);
      expect(body.hasBeenIssued).toEqual(true);
      expect(body.status).toEqual(null);
      expect(body.issueFacilityDetailsStarted).toEqual(true);
    });

    it('should remove bond status when issueFacilityDetailsStarted already exists in the bond', async () => {
      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      bondId = createBondResponse.body.bondId;

      const bondWithIssueFacilityDetailsStarted = {
        ...allBondFields,
        issueFacilityDetailsStarted: true,
        issueFacilityDetailsSubmitted: false,
      };

      await as(aBarclaysMaker).put(bondWithIssueFacilityDetailsStarted).to(`/v1/deals/${dealId}/bond/${bondId}`);

      const { body } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(body.status).toEqual(null);
    });

    it('should return 200 with updated bond, add issueFacilityDetailsProvided, hasBeenIssued, facilityStage, previousFacilityStage and timestamps', async () => {
      const { status, body } = await putIssueFacility(dealId, bondId, issueFacilityBody);

      expect(status).toEqual(200);
      expect(body.issueFacilityDetailsProvided).toEqual(true);
      expect(body.hasBeenIssued).toEqual(true);
      expect(body.previousFacilityStage).toEqual(CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED);
      expect(body.facilityStage).toEqual(CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED);
      expect(typeof body.requestedCoverStartDate === 'string').toEqual(true);
      expect(typeof body.issuedDate === 'string').toEqual(true);
    });

    it('should return 200 with updated bond, if special issue permission and more than 3 months in advance', async () => {
      const issueFacilityBodySpecialPermission = {
        ...createCoverDateFields('requestedCoverStartDate', add(nowDate, { months: 5 })),
        ...createCoverDateFields('coverEndDate', add(nowDate, { months: 8 })),
        ...createCoverDateFields('issuedDate', nowDate),
        name: '1234',
        specialIssuePermission: true,
      };
      const { status, body } = await putIssueFacility(dealId, bondId, issueFacilityBodySpecialPermission);

      expect(status).toEqual(200);
      expect(body.issueFacilityDetailsProvided).toEqual(true);
      expect(body.hasBeenIssued).toEqual(true);
      expect(body.previousFacilityStage).toEqual(CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.UNISSUED);
      expect(body.facilityStage).toEqual(CONSTANTS.FACILITIES.FACILITIES_STAGE.BOND.ISSUED);
      expect(typeof body.requestedCoverStartDate === 'string').toEqual(true);
      expect(typeof body.issuedDate === 'string').toEqual(true);
    });

    describe('with validation errors', () => {
      const incompleteIssueFacilityBody = {
        ...createCoverDateFields('requestedCoverStartDate', add(nowDate, { weeks: 1 })),
      };

      it('should return 400 with validationErrors, the bond,  and add issueFacilityDetailsProvided=false', async () => {
        const { status, body } = await putIssueFacility(dealId, bondId, incompleteIssueFacilityBody);

        expect(status).toEqual(400);
        expect(body.validationErrors).toBeDefined();
        expect(body.bond.issueFacilityDetailsProvided).toEqual(false);
      });

      describe('when there is no bond.name', () => {
        it('should return validationErrors, the bond with nameRequiredForIssuance', async () => {
          const { status, body } = await putIssueFacility(dealId, bondId, incompleteIssueFacilityBody);

          expect(status).toEqual(400);
          expect(body.validationErrors).toBeDefined();
          expect(body.bond.nameRequiredForIssuance).toEqual(true);
        });
      });

      describe('when requestedCoverStartDate exists and only some values are updated', () => {
        it('should remove requestedCoverStartDate timestamp', async () => {
          await putIssueFacility(dealId, bondId, issueFacilityBody);

          const incompleteDate = {
            'requestedCoverStartDate-day': format(nowDate, 'dd'),
            'requestedCoverStartDate-month': format(nowDate, 'MM'),
            'requestedCoverStartDate-year': '',
          };

          const { body } = await putIssueFacility(dealId, bondId, incompleteDate);
          expect(body.bond.requestedCoverStartDate).toEqual(null);
        });
      });

      describe('when issuedDate exists and only some values are updated', () => {
        it('should remove issuedDate timestamp', async () => {
          await putIssueFacility(dealId, bondId, issueFacilityBody);

          const incompleteDate = {
            'issuedDate-day': format(nowDate, 'dd'),
            'issuedDate-month': format(nowDate, 'MM'),
            'issuedDate-year': '',
          };

          const { body } = await putIssueFacility(dealId, bondId, incompleteDate);
          expect(body.bond.issuedDate).toEqual(null);
        });
      });
    });
  });
});
