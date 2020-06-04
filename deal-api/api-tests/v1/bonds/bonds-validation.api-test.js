const moment = require('moment');
const wipeDB = require('../../wipeDB');
const aDeal = require('../deals/deal-builder');
const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');
const { as } = require('../../api')(app);

describe('/v1/deals/:id/bond', () => {
  const newDeal = aDeal({
    details: {
      bankSupplyContractName: 'mock name',
      bankSupplyContractID: 'mock id',
    },
  });

  const mockCurrencies = [
    { id: 'GBP', text: 'GBP - UK Sterling' },
    { id: 'EUR', text: 'EUR - Euros' },
  ];

  const allBondFields = {
    bondIssuer: 'issuer',
    bondType: 'bond type',
    bondStage: 'unissued',
    ukefGuaranteeInMonths: '24',
    uniqueIdentificationNumber: '1234',
    bondBeneficiary: 'test',
    bondValue: '123',
    transactionCurrencySameAsSupplyContractCurrency: 'true',
    riskMarginFee: '1',
    coveredPercentage: '2',
    feeType: 'test',
    feeFrequency: 'test',
    dayCountBasis: 'test',
  };

  let aBarclaysMaker;
  let anEditor;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    aBarclaysMaker = testUsers().withRole('maker').withBankName('Barclays Bank').one();
    anEditor = testUsers().withRole('editor').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['bondCurrencies', 'deals']);

    await as(anEditor).postEach(mockCurrencies).to('/v1/bond-currencies');
  });

  describe('GET /v1/deals/:id/bond/:id', () => {
    it('returns a bond with validationErrors for all required fields', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createBondResponse.body;

      const { body } = await as(aBarclaysMaker).get(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(body.validationErrors.count).toEqual(8);
      expect(body.validationErrors.errorList.bondType).toBeDefined();
      expect(body.validationErrors.errorList.bondStage).toBeDefined();
      expect(body.validationErrors.errorList.bondValue).toBeDefined();
      expect(body.validationErrors.errorList.transactionCurrencySameAsSupplyContractCurrency).toBeDefined();
      expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
      expect(body.validationErrors.errorList.feeType).toBeDefined();
      expect(body.validationErrors.errorList.dayCountBasis).toBeDefined();
    });
  });

  describe('PUT /v1/deals/:id/bond/:bondId', () => {
    it('returns 400 with validation errors', async () => {
      const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
      const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

      const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
      const { bondId } = createBondResponse.body;

      const { status, body } = await as(aBarclaysMaker).put({ _id: bondId }).to(`/v1/deals/${dealId}/bond/${bondId}`);

      expect(status).toEqual(400);
      expect(body.validationErrors.count).toEqual(8);
      expect(body.validationErrors.errorList.bondType).toBeDefined();
      expect(body.validationErrors.errorList.bondStage).toBeDefined();
      expect(body.validationErrors.errorList.bondValue).toBeDefined();
      expect(body.validationErrors.errorList.transactionCurrencySameAsSupplyContractCurrency).toBeDefined();
      expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
      expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
      expect(body.validationErrors.errorList.feeType).toBeDefined();
      expect(body.validationErrors.errorList.dayCountBasis).toBeDefined();
      expect(body.validationErrors.conditionalErrorList).toBeDefined();
    });

    describe('when a bond has req.body.bondStage as `Issued`', () => {
      describe('when the requestedCoverStartDate has a value of 3 months or more', () => {
        it('should return requestedCoverStartDate validationError', async () => {
          const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
          const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

          const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
          const { bondId } = createBondResponse.body;

          const date = moment();
          const updatedRequestedCoverStartDate = moment(date).add(3, 'months').add(1, 'day');

          const updatedCoverEndDate = moment(date).add(4, 'months');

          const bondAsIssued = {
            _id: bondId,
            ...allBondFields,
            bondStage: 'Issued',
            bondIssuer: 'test',
            uniqueIdentificationNumber: '1234',
            'requestedCoverStartDate-day': moment(updatedRequestedCoverStartDate).format('DD'),
            'requestedCoverStartDate-month': moment(updatedRequestedCoverStartDate).format('MM'),
            'requestedCoverStartDate-year': moment(updatedRequestedCoverStartDate).format('YYYY'),
            'coverEndDate-day': moment(updatedCoverEndDate).format('DD'),
            'coverEndDate-month': moment(updatedCoverEndDate).format('MM'),
            'coverEndDate-year': moment(updatedCoverEndDate).format('YYYY'),
          };

          const { status, body } = await as(aBarclaysMaker).put(bondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);

          expect(status).toEqual(400);
          expect(body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.requestedCoverStartDate).toBeDefined();
        });
      });

      describe('when the coverEndDate is before today', () => {
        it('should return coverEndDate validationError', async () => {
          const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
          const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

          const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
          const { bondId } = createBondResponse.body;

          const updatedCoverEndDate = moment().subtract(1, 'day');

          const bondAsIssued = {
            _id: bondId,
            ...allBondFields,
            bondStage: 'Issued',
            bondIssuer: 'test',
            uniqueIdentificationNumber: '1234',
            'coverEndDate-day': moment(updatedCoverEndDate).format('DD'),
            'coverEndDate-month': moment(updatedCoverEndDate).format('MM'),
            'coverEndDate-year': moment(updatedCoverEndDate).format('YYYY'),
          };

          const { status, body } = await as(aBarclaysMaker).put(bondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);

          expect(status).toEqual(400);
          expect(body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
        });
      });

      describe('when the coverEndDate is before requestedCoverStartDate', () => {
        it('should return coverEndDate validationError', async () => {
          const postResult = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
          const dealId = postResult.body._id; // eslint-disable-line no-underscore-dangle

          const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);
          const { bondId } = createBondResponse.body;

          const date = moment();
          const updatedRequestedCoverStartDate = moment(date).add(2, 'months');
          const updatedCoverEndDate = moment(date).add(2, 'months').subtract(1, 'day');

          const bondAsIssued = {
            _id: bondId,
            ...allBondFields,
            bondStage: 'Issued',
            bondIssuer: 'test',
            uniqueIdentificationNumber: '1234',
            'requestedCoverStartDate-day': moment(updatedRequestedCoverStartDate).format('DD'),
            'requestedCoverStartDate-month': moment(updatedRequestedCoverStartDate).format('MM'),
            'requestedCoverStartDate-year': moment(updatedRequestedCoverStartDate).format('YYYY'),
            'coverEndDate-day': moment(updatedCoverEndDate).format('DD'),
            'coverEndDate-month': moment(updatedCoverEndDate).format('MM'),
            'coverEndDate-year': moment(updatedCoverEndDate).format('YYYY'),
          };

          const { status, body } = await as(aBarclaysMaker).put(bondAsIssued).to(`/v1/deals/${dealId}/bond/${bondId}`);

          expect(status).toEqual(400);
          expect(body.bond._id).toEqual(bondId); // eslint-disable-line no-underscore-dangle
          expect(body.validationErrors.count).toEqual(1);
          expect(body.validationErrors.errorList.coverEndDate).toBeDefined();
        });
      });
    });

    describe('when a bond has req.body.transactionCurrencySameAsSupplyContractCurrency as false and conversionRate is an invalid format', () => {
      it('should return additional validationError for conversionRate', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle
        const nowDate = moment();

        const bondBody = {
          ...allBondFields,
          bondValue: '123',
          transactionCurrencySameAsSupplyContractCurrency: 'false',
          currency: 'EUR',
          conversionRate: '123456789',
          'conversionRateDate-day': moment(nowDate).format('DD'),
          'conversionRateDate-month': moment(nowDate).format('MM'),
          'conversionRateDate-year': moment(nowDate).format('YYYY'),
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const updateBondResponse = await as(aBarclaysMaker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(updateBondResponse.status).toEqual(400);
        expect(updateBondResponse.body.validationErrors.count).toEqual(1);
        expect(updateBondResponse.body.validationErrors.errorList.conversionRate).toBeDefined();
      });
    });

    describe('when a bond has req.body.transactionCurrencySameAsSupplyContractCurrency as false and conversionRateDate is in the future', () => {
      it('should return additional validationError for conversionRateDate', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const date = moment().add(1, 'day');

        const bondBody = {
          ...allBondFields,
          bondValue: '123',
          transactionCurrencySameAsSupplyContractCurrency: 'false',
          currency: 'EUR',
          conversionRate: '100',
          'conversionRateDate-day': moment(date).format('DD'),
          'conversionRateDate-month': moment(date).format('MM'),
          'conversionRateDate-year': moment(date).format('YYYY'),
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const updateBondResponse = await as(aBarclaysMaker).put(bondBody).to(`/v1/deals/${dealId}/bond/${bondId}`);
        expect(updateBondResponse.status).toEqual(400);
        expect(updateBondResponse.body.validationErrors.count).toEqual(1);
        expect(updateBondResponse.body.validationErrors.errorList.conversionRateDate).toBeDefined();
      });
    });

    describe('when a bond has req.body.transactionCurrencySameAsSupplyContractCurrency changed from false to true', () => {
      it('should return additional validationErrors when values are missing', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          transactionCurrencySameAsSupplyContractCurrency: 'false',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(3);
        expect(body.validationErrors.errorList.currency).toBeDefined();
        expect(body.validationErrors.errorList.conversionRate).toBeDefined();
        expect(body.validationErrors.errorList.conversionRateDate).toBeDefined();
      });
    });

    describe('riskMarginFee', () => {
      it('should return validationError when riskMarginFee is not a number', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          riskMarginFee: '123test',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must be a number, like 1 or 12.65');
      });

      it('should return validationError when riskMarginFee is not between 1 and 99', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          riskMarginFee: '100',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must be between 1 and 99');
      });

      it('should return validationError when coveredPercentage contains more than 4 decimals', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          riskMarginFee: '60.12345',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.riskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.riskMarginFee.text).toEqual('Risk Margin Fee % must have less than 5 decimals, like 12 or 12.0010');
      });
    });

    describe('coveredPercentage', () => {
      it('should return validationError when coveredPercentage is not between 1 and 99', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          coveredPercentage: '123test',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
        expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be a number, like 1 or 80');
      });

      it('should return validationError when coveredPercentage is less than 1', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          coveredPercentage: '0.09',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
        expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
      });

      it('should return validationError when coveredPercentage is greater than 80', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          coveredPercentage: '81',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.coveredPercentage).toBeDefined();
        expect(body.validationErrors.errorList.coveredPercentage.text).toEqual('Covered Percentage must be between 1 and 80');
      });
    });

    describe('minimumRiskMarginFee', () => {
      it('should return validationError when minimumRiskMarginFee is not a number', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          minimumRiskMarginFee: 'test',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be a number, like 1 or 12.65');
      });

      it('should return validationError when minimumRiskMarginFee has more than 16 characters', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          minimumRiskMarginFee: '12345678901234567',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be 16 characters or fewer');
      });

      it('should return validationError when minimumRiskMarginFee is less than 0.01', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          minimumRiskMarginFee: '0',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be between 0.01 and 14.99');
      });

      it('should return validationError when minimumRiskMarginFee is greater than 14.99', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          minimumRiskMarginFee: '15',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must be between 0.01 and 14.99');
      });

      it('should return validationError when minimumRiskMarginFee contains more than 2 decimals', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          minimumRiskMarginFee: '8.123',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.count).toEqual(1);
        expect(body.validationErrors.errorList.minimumRiskMarginFee).toBeDefined();
        expect(body.validationErrors.errorList.minimumRiskMarginFee.text).toEqual('Minimum risk margin fee must have less than 3 decimals, like 12 or 12.10');
      });
    });

    describe('when a bond has req.body.feeType as `In advance`', () => {
      it('should return additional validationError for feeFrequency', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          feeFrequency: undefined,
          feeType: 'In advance',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.errorList.feeFrequency).toBeDefined();
      });
    });

    describe('when a bond has req.body.feeType as `In arrear`', () => {
      it('should return additional validationError for feeFrequency', async () => {
        const deal = await as(aBarclaysMaker).post(newDeal).to('/v1/deals/');
        const dealId = deal.body._id; // eslint-disable-line no-underscore-dangle

        const bond = {
          ...allBondFields,
          feeFrequency: undefined,
          feeType: 'In arrear',
        };

        const createBondResponse = await as(aBarclaysMaker).put({}).to(`/v1/deals/${dealId}/bond/create`);

        const { body: createBondBody } = createBondResponse;
        const { bondId } = createBondBody;

        const { status, body } = await as(aBarclaysMaker).put(bond).to(`/v1/deals/${dealId}/bond/${bondId}`);

        expect(status).toEqual(400);
        expect(body.validationErrors.errorList.feeFrequency).toBeDefined();
      });
    });
  });
});
