const { BOND_TYPE } = require('@ukef/dtfs2-common');
const { generateParsedMockPortalUserAuditDatabaseRecord } = require('@ukef/dtfs2-common/change-stream/test-helpers');
const { CURRENCY } = require('@ukef/dtfs2-common');
const { format, add } = require('date-fns');
const databaseHelper = require('../../database-helper');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as, get } = require('../../api')(app);
const { withClientAuthenticationTests } = require('../../common-tests/client-authentication-tests');
const { withRoleAuthorisationTests } = require('../../common-tests/role-authorisation-tests');
const { MAKER, READ_ONLY, ADMIN } = require('../../../src/v1/roles/roles');
const { calculateGuaranteeFee, calculateUkefExposure } = require('../../../src/v1/section-calculations');
const { findOneCurrency } = require('../../../src/v1/controllers/currencies.controller');
const { DB_COLLECTIONS } = require('../../fixtures/constants');

describe('/v1/deals/:id/bond', () => {
  const newDeal = aDeal({
    additionalRefName: 'mock name',
    bankInternalRefName: 'mock id',
    submissionDetails: {
      supplyContractCurrency: {
        id: CURRENCY.GBP,
      },
    },
    eligibility: {
      criteria: [{ id: 15, answer: true }],
    },
  });

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: BOND_TYPE.BID_BOND,
    facilityStage: 'unissued',
    hasBeenIssued: 'false',
    ukefGuaranteeInMonths: '24',
    name: '1234',
    bondBeneficiary: 'test',
    value: '123456.55',
    currencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '9.09',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: '365',
  };

  const expectedGuaranteeFee = calculateGuaranteeFee(allBondFields.riskMarginFee);
  const expectedUkefExposure = calculateUkefExposure(allBondFields.value, allBondFields.coveredPercentage);

  const nowDate = new Date();
  const requestedCoverStartDate = () => ({
    'requestedCoverStartDate-day': format(nowDate, 'dd'),
    'requestedCoverStartDate-month': format(nowDate, 'MM'),
    'requestedCoverStartDate-year': format(nowDate, 'yyyy'),
  });

  const coverEndDate = () => {
    const nowPlusOneMonth = add(nowDate, { months: 1 });

    return {
      'coverEndDate-day': format(nowPlusOneMonth, 'dd'),
      'coverEndDate-month': format(nowPlusOneMonth, 'MM'),
      'coverEndDate-year': format(nowPlusOneMonth, 'yyyy'),
    };
  };

  let testUsers;
  let testbank1Maker;
  let testbank2Maker;
  let aSuperuser;
  let testUser;

  const createBond = async () => {
    const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals');
    const dealId = deal.body._id;

    const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);
    const { bondId } = createBondResponse.body;
    return {
      dealId,
      bondId,
    };
  };

  beforeAll(async () => {
    testUsers = await testUserCache.initialise(app);
    testUser = testUsers().withRole(READ_ONLY).one();
    testbank1Maker = testUsers().withRole(MAKER).withBankName('Bank 1').one();
    testbank2Maker = testUsers().withRole(MAKER).withBankName('Bank 2').one();
    aSuperuser = testUsers().superuser().one();
  });

  beforeEach(async () => {
    await databaseHelper.wipe([DB_COLLECTIONS.DEALS]);
    await databaseHelper.wipe([DB_COLLECTIONS.FACILITIES]);
  });

  describe('GET /v1/deals/:id/bond/:id', () => {
    let testbank1BondUrl;
    let dealId;
    let bondId;

    beforeEach(async () => {
      const {
        body: { _id: createdDealId },
      } = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      dealId = createdDealId;

      const {
        body: { bondId: createdBondId },
      } = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      bondId = createdBondId;

      testbank1BondUrl = `/v1/deals/${dealId}/bond/${bondId}`;
    });

    withClientAuthenticationTests({
      makeRequestWithoutAuthHeader: () => get(testbank1BondUrl),
      makeRequestWithAuthHeader: (authHeader) => get(testbank1BondUrl, { headers: { Authorization: authHeader } }),
    });

    withRoleAuthorisationTests({
      allowedRoles: [MAKER, READ_ONLY, ADMIN],
      getUserWithRole: (role) => testUsers().withRole(role).withBankName('Bank 1').one(),
      makeRequestAsUser: (user) => as(user).get(testbank1BondUrl),
      successStatusCode: 200,
    });

    it('400s requests that do not with a valid bond id param', async () => {
      const { status } = await as(testbank1Maker).get('/v1/deals/620a1aa095a618b12da38c7b/bond/123456');

      expect(status).toEqual(400);
    });

    it('400s requests that do not with a valid deal id param', async () => {
      const { status } = await as(testbank1Maker).get('/v1/deals/13456/bond/620a1aa095a618b12da38c7b');

      expect(status).toEqual(400);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { status } = await as(testbank2Maker).get(testbank1BondUrl);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(testbank1Maker).get('/v1/deals/620a1aa095a618b12da38c7b/bond/620a1aa095a618b12da38c7b');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const { status } = await as(testbank1Maker).get(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(aSuperuser).get(testbank1BondUrl);

      expect(status).toEqual(200);
    });

    it('returns a bond with dealId, `Incomplete` status', async () => {
      const { status, body } = await as(testbank1Maker).get(testbank1BondUrl);

      expect(status).toEqual(200);
      expect(body.bond._id).toEqual(bondId);
      expect(body.bond.status).toEqual('Incomplete');
      expect(body.dealId).toEqual(dealId);
    });

    describe('when a bond has all required fields', () => {
      it('returns a bond with dealId and `Completed` status and requestedCoverStartDate', async () => {
        const bond = {
          ...allBondFields,
          ...requestedCoverStartDate(),
          ...coverEndDate(),
        };

        const createBondResponse = await as(testbank1Maker).put(bond).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId: createdBondId } = createBondBody;

        const updateBondResponse = await as(testbank1Maker).put(bond).to(`/v1/deals/${dealId}/bond/${createdBondId}`);

        expect(updateBondResponse.status).toEqual(200);

        const getBondResponse = await as(testbank1Maker).get(`/v1/deals/${dealId}/bond/${createdBondId}`);

        expect(getBondResponse.status).toEqual(200);

        expect(getBondResponse.body.bond._id).toEqual(createdBondId);
        expect(getBondResponse.body.dealId).toEqual(dealId);
        expect(getBondResponse.body.validationErrors.count).toEqual(0);
        expect(getBondResponse.body.bond.status).toEqual('Completed');
        expect(getBondResponse.body.bond.requestedCoverStartDate).toEqual(expect.any(String));
      });
    });
  });

  describe('PUT /v1/deals/:id/bond/create', () => {
    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/620a1aa095a618b12da38c7b/bond/create');

      expect(status).toEqual(401);
    });

    it('400s requests that do not present with a valid id parameter', async () => {
      const { status } = await as(testbank1Maker).put().to('/v1/deals/12345/bond/create');

      expect(status).toEqual(400);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).put().to('/v1/deals/620a1aa095a618b12da38c7b/bond/create');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const { status } = await as(testbank2Maker).put().to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown resources', async () => {
      const { status } = await as(testbank1Maker).put().to('/v1/deals/620a1aa095a618b12da38c7b/bond/create');

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const { status } = await as(aSuperuser).put({}).to(`/v1/deals/${dealId}/bond/create`);

      expect(status).toEqual(200);
    });

    it('adds an empty bond to a deal', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id;

      const newBond = {
        type: 'Bond',
        dealId,
      };

      await as(testbank1Maker).put(newBond).to(`/v1/deals/${dealId}/bond/create`);

      const { status } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);

      const getDeal = await as(testbank1Maker).get(`/v1/deals/${dealId}`);
      expect(getDeal.body.deal.facilities.length).toEqual(1);
    });
  });

  describe('PUT /v1/deals/:id/bond/:bondId', () => {
    let testbank1Maker1AuditRecord;

    beforeAll(async () => {
      testbank1Maker1AuditRecord = generateParsedMockPortalUserAuditDatabaseRecord(testbank1Maker._id);
    });

    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().put().to('/v1/deals/620a1aa095a618b12da38c7b/bond/620a1aa095a618b12da38c7b');

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUsers).put().to('/v1/deals/620a1aa095a618b12da38c7b/bond/620a1aa095a618b12da38c7b');

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const { status } = await as(testbank2Maker).put().to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(testbank1Maker).put({}).to('/v1/deals/620a1aa095a618b12da38c7b/bond/620a1aa095a618b12da38c7b');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const { status } = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const postResult = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      const dealId = postResult.body._id;

      const { body } = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = body;

      const { status } = await as(aSuperuser).put(allBondFields).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
    });

    describe('with all required fields in body', () => {
      it('updates an existing bond and adds currency, status, guaranteeFeePayableByBank and ukefExposure values', async () => {
        const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id;

        const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const bond = {
          ...allBondFields,
          ...coverEndDate(),
        };

        const { status } = await as(testbank1Maker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(200);

        const { status: updatedDealStatus, body: updatedDealBody } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);

        const updatedDeal = updatedDealBody.deal;

        expect(updatedDealStatus).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) => b._id === bondId);

        const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

        const expectedUpdatedBond = {
          _id: bondId,
          dealId,
          ...allBondFields,
          ...coverEndDate(),
          currency: {
            currencyId: expectedCurrency.currencyId,
            text: expectedCurrency.text,
            id: expectedCurrency.id,
          },
          guaranteeFeePayableByBank: expectedGuaranteeFee,
          ukefExposure: expectedUkefExposure,
          status: 'Completed',
          createdDate: expect.any(Number),
          updatedAt: expect.any(Number),
          type: 'Bond',
          requestedCoverStartDate: null,
          coverEndDate: expect.any(String),
          conversionRate: null,
          'conversionRateDate-day': null,
          'conversionRateDate-month': null,
          'conversionRateDate-year': null,
          auditRecord: testbank1Maker1AuditRecord,
        };
        expect(updatedBond).toEqual(expectedUpdatedBond);
      });
    });

    describe('when a bond has req.body.facilityStage as `Issued`', () => {
      it('should remove `unissued` related values from the bond', async () => {
        const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id;

        const bondAsUnissued = {
          ...allBondFields,
          facilityStage: 'Unissued',
          ukefGuaranteeInMonths: '12',
        };

        const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(testbank1Maker).put(bondAsUnissued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);
        expect(body.hasBeenIssued).toEqual(false);

        const updatedBondAsIssued = {
          ...bondAsUnissued,
          facilityStage: 'Issued',
          bondIssuer: 'test',
          ...coverEndDate(),
          name: '1234',
        };

        const { status: secondUpdateStatus, body: secondUpdateBody } = await as(testbank1Maker)
          .put(updatedBondAsIssued)
          .to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);
        expect(secondUpdateBody.hasBeenIssued).toEqual(true);
        const { status: updatedDealStatus, body: updatedDealBody } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);
        expect(updatedDealStatus).toEqual(200);

        const updatedDeal = updatedDealBody.deal;

        const updatedBond = updatedDeal.bondTransactions.items.find((b) => b._id === bondId);

        const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

        const expectedBond = {
          _id: bondId,
          dealId,
          ...updatedBondAsIssued,
          currency: {
            currencyId: expectedCurrency.currencyId,
            text: expectedCurrency.text,
            id: expectedCurrency.id,
          },
          guaranteeFeePayableByBank: expectedGuaranteeFee,
          ukefExposure: expectedUkefExposure,
          status: 'Completed',
          createdDate: expect.any(Number),
          updatedAt: expect.any(Number),
          type: 'Bond',
          hasBeenIssued: true,
          requestedCoverStartDate: null,
          coverEndDate: expect.any(String),
          'requestedCoverStartDate-day': null,
          'requestedCoverStartDate-month': null,
          'requestedCoverStartDate-year': null,
          ukefGuaranteeInMonths: null,
          conversionRate: null,
          'conversionRateDate-day': null,
          'conversionRateDate-month': null,
          'conversionRateDate-year': null,
          auditRecord: testbank1Maker1AuditRecord,
        };

        expect(updatedBond).toEqual(expectedBond);
      });
    });

    describe('when a bond has req.body.facilityStage as `Unissued`', () => {
      it('should remove `issued` related values from the bond', async () => {
        const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id;

        const bondAsIssued = {
          ...allBondFields,
          ...requestedCoverStartDate(),
          ...coverEndDate(),
          facilityStage: 'Issued',
        };

        const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(testbank1Maker).put(bondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);
        expect(body.hasBeenIssued).toEqual(true);

        const updatedBondAsUnissued = {
          ...allBondFields,
          facilityStage: 'Unissued',
          bondIssuer: 'test',
          ukefGuaranteeInMonths: '12',
        };

        const { status: secondUpdateStatus, body: secondUpdateBody } = await as(testbank1Maker)
          .put(updatedBondAsUnissued)
          .to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);
        expect(secondUpdateBody.hasBeenIssued).toEqual(false);

        const { status: updatedDealStatus, body: updatedDealBody } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);
        expect(updatedDealStatus).toEqual(200);

        const updatedDeal = updatedDealBody.deal;

        const updatedBond = updatedDeal.bondTransactions.items.find((b) => b._id === bondId);

        const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

        const expectedBond = {
          _id: bondId,
          dealId,
          ...updatedBondAsUnissued,
          currency: {
            currencyId: expectedCurrency.currencyId,
            text: expectedCurrency.text,
            id: expectedCurrency.id,
          },
          guaranteeFeePayableByBank: expectedGuaranteeFee,
          ukefExposure: expectedUkefExposure,
          status: 'Completed',
          createdDate: expect.any(Number),
          updatedAt: expect.any(Number),
          type: 'Bond',
          hasBeenIssued: false,
          requestedCoverStartDate: null,
          coverEndDate: null,
          'requestedCoverStartDate-day': null,
          'requestedCoverStartDate-month': null,
          'requestedCoverStartDate-year': null,
          coverDateConfirmed: true,
          'coverEndDate-day': null,
          'coverEndDate-month': null,
          'coverEndDate-year': null,
          name: null,
          conversionRate: null,
          'conversionRateDate-day': null,
          'conversionRateDate-month': null,
          'conversionRateDate-year': null,
          auditRecord: testbank1Maker1AuditRecord,
        };
        expect(updatedBond).toEqual(expectedBond);
      });
    });

    it("should add the deal's supplyContractCurrency to the bond's currency", async () => {
      const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      const bondBody = {
        ...allBondFields,
        currencySameAsSupplyContractCurrency: 'true',
      };

      const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const { status } = await as(testbank1Maker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);

      const { body: updatedDeal } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);

      expect(status).toEqual(200);

      const updatedBond = updatedDeal.deal.bondTransactions.items.find((b) => b._id === bondId);

      const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);

      expect(updatedBond).toEqual({
        _id: bondId,
        dealId,
        ...bondBody,
        currency: {
          currencyId: expectedCurrency.currencyId,
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        },
        guaranteeFeePayableByBank: expectedGuaranteeFee,
        ukefExposure: expectedUkefExposure,
        status: 'Completed',
        createdDate: expect.any(Number),
        updatedAt: expect.any(Number),
        type: 'Bond',
        requestedCoverStartDate: null,
        coverEndDate: null,
        conversionRate: null,
        'conversionRateDate-day': null,
        'conversionRateDate-month': null,
        'conversionRateDate-year': null,
        auditRecord: testbank1Maker1AuditRecord,
      });
    });

    describe('when a bond has req.body.currencySameAsSupplyContractCurrency changed from false to true', () => {
      it("should remove `currency is NOT the same` values from the bond and add the deal's supplyContractCurrency", async () => {
        const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id;

        const bondBody = {
          ...allBondFields,
          value: '123',
          currencySameAsSupplyContractCurrency: 'false',
          currency: 'EUR',
          conversionRate: '100',
          'conversionRateDate-day': format(nowDate, 'dd'),
          'conversionRateDate-month': format(nowDate, 'MM'),
          'conversionRateDate-year': format(nowDate, 'yyyy'),
        };

        const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status } = await as(testbank1Maker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(status).toEqual(200);

        const bondWithSameCurrencyAsContract = {
          value: '456',
          currencySameAsSupplyContractCurrency: 'true',
        };

        const { status: secondUpdateStatus } = await as(testbank1Maker).put(bondWithSameCurrencyAsContract).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(secondUpdateStatus).toEqual(200);

        const { body: updatedDealBody } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);
        const updatedDeal = updatedDealBody.deal;

        expect(status).toEqual(200);

        const updatedBond = updatedDeal.bondTransactions.items.find((b) => b._id === bondId);

        expect(updatedBond._id).toEqual(bondId);
        expect(updatedBond.value).toEqual(bondWithSameCurrencyAsContract.value);
        expect(updatedBond.currencySameAsSupplyContractCurrency).toEqual(bondWithSameCurrencyAsContract.currencySameAsSupplyContractCurrency);
        expect(updatedBond.conversionRate).toEqual(null);
        expect(updatedBond['conversionRateDate-day']).toEqual(null);
        expect(updatedBond['conversionRateDate-month']).toEqual(null);
        expect(updatedBond['conversionRateDate-year']).toEqual(null);

        const { data: expectedCurrency } = await findOneCurrency(newDeal.submissionDetails.supplyContractCurrency.id);
        expect(updatedBond.currency).toEqual({
          currencyId: expectedCurrency.currencyId,
          text: expectedCurrency.text,
          id: expectedCurrency.id,
        });
      });
    });

    describe("when req.body.feeType is changed to 'At maturity'", () => {
      it('should remove feeFrequency', async () => {
        const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id;

        const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const bond = {
          feeType: 'In advance',
          feeFrequency: 'Quarterly',
        };

        await as(testbank1Maker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        const updatedBond = {
          ...bond,
          feeType: 'At maturity',
        };

        const { body } = await as(testbank1Maker).put(updatedBond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(body.feeFrequency).toEqual(undefined);
      });
    });

    it('should generate requestedCoverStartDate and coverDateConfirmed properties', async () => {
      const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const bond = {
        ...allBondFields,
        ...requestedCoverStartDate(),
        ...coverEndDate(),
      };

      const { status, body } = await as(testbank1Maker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
      expect(body.coverDateConfirmed).toEqual(true);
      expect(body.requestedCoverStartDate).toEqual(expect.any(String));
      expect(body['requestedCoverStartDate-day']).toEqual(bond['requestedCoverStartDate-day']);
      expect(body['requestedCoverStartDate-month']).toEqual(bond['requestedCoverStartDate-month']);
      expect(body['requestedCoverStartDate-year']).toEqual(bond['requestedCoverStartDate-year']);
    });

    it('should generate updatedAt timestamp', async () => {
      const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      const createBondResponse = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body: createBondBody } = createBondResponse;
      const { bondId } = createBondBody;

      const bond = allBondFields;

      const { status, body } = await as(testbank1Maker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(200);
      expect(body.updatedAt).toEqual(expect.any(Number));
    });

    it("should update the associated deal's facilitiesUpdated timestamp", async () => {
      // create deal
      const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals/');
      const dealId = deal.body._id;

      // create bond facility
      const { body: createdBond } = await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createdBond;

      const bondUpdate = { test: true };

      // update bond facility
      await as(testbank1Maker).put(bondUpdate).to(`/v1/deals/${dealId}/bond/${bondId}`);

      // get the deal, check facilities timestamp
      const { body: dealAfterUpdate } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);
      expect(dealAfterUpdate.deal.facilitiesUpdated).toEqual(expect.any(Number));
    });
  });

  describe('DELETE /v1/deals/:id/bond/:id', () => {
    let dealId;
    let bondId;

    beforeEach(async () => {
      const addBondResponse = await createBond();
      dealId = addBondResponse.dealId;
      bondId = addBondResponse.bondId;
    });

    it('401s requests that do not present a valid Authorization token', async () => {
      const { status } = await as().remove().to(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests that do not come from a user with role=maker', async () => {
      const { status } = await as(testUser).remove().to(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(401);
    });

    it('401s requests if <user>.bank != <resource>/bank', async () => {
      const { status } = await as(testbank2Maker).remove().to(`/v1/deals/${dealId}/bond/12345678`);

      expect(status).toEqual(401);
    });

    it('404s requests for unknown deal', async () => {
      const { status } = await as(testbank1Maker).remove().to('/v1/deals/620a1aa095a618b12da38c7b/bond/620a1aa095a618b12da38c7b');

      expect(status).toEqual(404);
    });

    it('404s requests for unknown bond', async () => {
      const { status } = await as(testbank1Maker).remove().to(`/v1/deals/${dealId}/bond/620a1aa095a618b12da38c7b`);

      expect(status).toEqual(404);
    });

    it('accepts requests if <user>.bank.id == *', async () => {
      const { status } = await as(testbank1Maker).remove().to(`/v1/deals/${dealId}/bond/${bondId}`);
      expect(status).toEqual(200);
    });

    it('removes a bond from a deal', async () => {
      const deal = await as(testbank1Maker).post(newDeal).to('/v1/deals');
      dealId = deal.body._id;

      await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      await as(testbank1Maker).put({}).to(`/v1/deals/${dealId}/bond/create`);

      const { body } = await as(testbank1Maker).get(`/v1/deals/${dealId}`);

      const createdDeal = body.deal;
      expect(createdDeal.facilities.length).toEqual(3);

      const bondIdToDelete = createdDeal.facilities[0];

      const { status } = await as(testbank1Maker).remove().to(`/v1/deals/${dealId}/bond/${bondIdToDelete}`);
      expect(status).toEqual(200);

      const getBondAfterDelete = await as(testbank1Maker).get(`/v1/deals/${dealId}/bond/${bondIdToDelete}`);
      expect(getBondAfterDelete.status).toEqual(404);

      const dealAfterDeletingBond = await as(testbank1Maker).get(`/v1/deals/${dealId}`);

      expect(dealAfterDeletingBond.body.deal.facilities.length).toEqual(2);
    });
  });
});
