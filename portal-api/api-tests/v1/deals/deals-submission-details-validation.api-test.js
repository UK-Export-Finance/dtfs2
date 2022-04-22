const moment = require('moment');

const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);

const newDeal = aDeal({
  updatedAt: Date.now(),
  additionalRefName: 'mock name',
  bankInternalRefName: 'mock id',
  status: 'Draft',
  comments: [{
    username: 'bananaman',
    timestamp: '1984/12/25 00:00:00:001',
    text: 'Merry Christmas from the 80s',
  }, {
    username: 'supergran',
    timestamp: '1982/12/25 00:00:00:001',
    text: 'Also Merry Christmas from the 80s',
  }],
});

describe('PUT /v1/deals/:id/submission-details validation rules', () => {
  let anHSBCMaker;

  beforeAll(async () => {
    const testUsers = await testUserCache.initialise(app);
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
    await wipeDB.wipe(['facilities']);
  });

  describe('For all cases', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {};

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    it('expects supplier-type', () => {
      expect(validationErrors.errorList['supplier-type']).toEqual({
        order: expect.any(String),
        text: 'Supplier type is required',
      });
    });

    it('expects supplier-name', () => {
      expect(validationErrors.errorList['supplier-name']).toEqual({
        order: expect.any(String),
        text: 'Supplier name is required',
      });
    });

    it('expects supplier-correspondence-address-is-different', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-is-different']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence address is required',
      });
    });

    it('expects legallyDistinct', () => {
      expect(validationErrors.errorList.legallyDistinct).toEqual({
        order: expect.any(String),
        text: 'Guarantor/Indemnifier is required',
      });
    });

    describe('expects supplier address', () => {
      it('expects supplier-address-line-1', () => {
        expect(validationErrors.errorList['supplier-address-line-1']).toEqual({
          order: expect.any(String),
          text: 'Supplier address line 1 is required',
        });
      });

      it('expects supplier-address-country', () => {
        expect(validationErrors.errorList['supplier-address-country']).toEqual({
          order: expect.any(String),
          text: 'Supplier country is required',
        });
      });
    });

    it('expects industry-sector', () => {
      expect(validationErrors.errorList['industry-sector']).toEqual({
        order: expect.any(String),
        text: 'Industry Sector is required',
      });
    });

    it('expects industry-class', () => {
      expect(validationErrors.errorList['industry-class']).toEqual({
        order: expect.any(String),
        text: 'Industry Class is required',
      });
    });

    it('expects sme-type', () => {
      expect(validationErrors.errorList['sme-type']).toEqual({
        order: expect.any(String),
        text: 'SME type is required',
      });
    });

    it('expects supply-contract-description', () => {
      expect(validationErrors.errorList['supply-contract-description']).toEqual({
        order: expect.any(String),
        text: 'Supply Contract Description is required',
      });
    });

    it('expects buyer-name', () => {
      expect(validationErrors.errorList['buyer-name']).toEqual({
        order: expect.any(String),
        text: 'Buyer name is required',
      });
    });

    describe('expects buyer address', () => {
      it('expects buyer-address-line-1', () => {
        expect(validationErrors.errorList['buyer-address-line-1']).toEqual({
          order: expect.any(String),
          text: 'Buyer address line 1 is required',
        });
      });

      it('expects buyer-address-country', () => {
        expect(validationErrors.errorList['buyer-address-country']).toEqual({
          order: expect.any(String),
          text: 'Buyer country is required',
        });
      });
    });

    it('expects supplyContractValue', () => {
      expect(validationErrors.errorList.supplyContractValue).toEqual({
        order: expect.any(String),
        text: 'Supply Contract value is required',
      });
    });

    it('expects supplyContractCurrency', () => {
      expect(validationErrors.errorList.supplyContractCurrency).toEqual({
        order: expect.any(String),
        text: 'Supply Contract currency is required',
      });
    });
  });

  describe('If supplyContractCurrency !== GBP, conversion rate and conversion date are required', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects conversion details', () => {
      it('expects supplyContractConversionRateToGBP', () => {
        expect(validationErrors.errorList.supplyContractConversionRateToGBP).toEqual({
          order: expect.any(String),
          text: 'Supply Contract conversion rate is required for non-GBP currencies',
        });
      });

      it('expects supplyContractConversionDate', () => {
        expect(validationErrors.errorList.supplyContractConversionDate).toEqual({
          order: expect.any(String),
          text: 'Supply Contract conversion date is required for non-GBP currencies',
        });
      });
    });
  });

  describe('conversion rate', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        supplyContractConversionRateToGBP: 'not a number',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects supplyContractConversionRateToGBP', () => {
      it('to be  number', () => {
        expect(validationErrors.errorList.supplyContractConversionRateToGBP).toEqual({
          order: expect.any(String),
          text: 'Supply Contract conversion rate must be a number with up to 6 decimal places',
        });
      });
    });
  });

  describe('conversion rate', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        supplyContractConversionRateToGBP: '321.1234567',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects supplyContractConversionRateToGBP', () => {
      it('to have at most 6 decimal places', () => {
        expect(validationErrors.errorList.supplyContractConversionRateToGBP).toEqual({
          order: expect.any(String),
          text: 'Supply Contract conversion rate must be a number with up to 6 decimal places',
        });
      });
    });
  });

  describe('conversion rate', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        supplyContractConversionRateToGBP: '1',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects supplyContractConversionRateToGBP', () => {
      it('to work for whole numbers', () => {
        expect(validationErrors.errorList.supplyContractConversionRateToGBP).toBeUndefined();
      });
    });
  });

  describe('Conversion date in the future', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const dateInTheFuture = moment().add(1, 'days');
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        'supplyContractConversionDate-day': moment(dateInTheFuture).format('DD'),
        'supplyContractConversionDate-month': moment(dateInTheFuture).format('MM'),
        'supplyContractConversionDate-year': moment(dateInTheFuture).format('YYYY'),
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('Conversion Date', () => {
      it('cannot be in the future', () => {
        expect(validationErrors.errorList.supplyContractConversionDate).toEqual({
          order: expect.any(String),
          text: 'Supply Contract conversion date cannot be in the future',
        });
      });
    });
  });

  describe('Conversion date in the past', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;

      const dateInThePast = moment().subtract(31, 'days');
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        'supplyContractConversionDate-day': moment(dateInThePast).format('DD'),
        'supplyContractConversionDate-month': moment(dateInThePast).format('MM'),
        'supplyContractConversionDate-year': moment(dateInThePast).format('YYYY'),
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('Conversion Date', () => {
      it('cannot be more than 30 days in the past', () => {
        expect(validationErrors.errorList.supplyContractConversionDate).toEqual({
          order: expect.any(String),
          text: 'Supply Contract conversion date cannot be more than 30 days in the past',
        });
      });
    });
  });

  describe('If supplyContractCurrency !== GBP, if any conversion date fields are entered, the missing fields are required', () => {
    it('day field is required', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        'supplyContractConversionDate-month': '12',
        'supplyContractConversionDate-year': '2019',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { validationErrors } = body;

      expect(validationErrors.errorList['supplyContractConversionDate-day']).toEqual({
        order: expect.any(String),
        text: 'Supply Contract conversion date Day is required for non-GBP currencies',
      });
    });

    it('month field is required', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        'supplyContractConversionDate-day': '25',
        'supplyContractConversionDate-year': '2019',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { validationErrors } = body;

      expect(validationErrors.errorList['supplyContractConversionDate-month']).toEqual({
        order: expect.any(String),
        text: 'Supply Contract conversion date Month is required for non-GBP currencies',
      });
    });

    it('year field is required', async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        supplyContractCurrency: { id: 'USD' },
        'supplyContractConversionDate-month': '12',
        'supplyContractConversionDate-day': '25',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      const { validationErrors } = body;

      expect(validationErrors.errorList['supplyContractConversionDate-year']).toEqual({
        order: expect.any(String),
        text: 'Supply Contract conversion date Year is required for non-GBP currencies',
      });
    });
  });

  describe('If supplier-address === GBR, postcode is required', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = { 'supplier-address-country': 'GBR' };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects supplier address', () => {
      it('expects supplier-address-postcode', () => {
        expect(validationErrors.errorList['supplier-address-postcode']).toEqual({
          order: expect.any(String),
          text: 'Supplier postcode is required for UK addresses',
        });
      });
    });
  });

  describe('If supplier-address !== GBR, town is required', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = { 'supplier-address-country': 'CAN' };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects supplier address', () => {
      it('expects supplier-address-town', () => {
        expect(validationErrors.errorList['supplier-address-town']).toEqual({
          order: expect.any(String),
          text: 'Supplier town is required for non-UK addresses',
        });
      });
    });
  });

  describe('If buyer-address === GBR, postcode is required', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = { 'buyer-address-country': 'GBR' };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects buyer address', () => {
      it('expects buyer-address-postcode', () => {
        expect(validationErrors.errorList['buyer-address-postcode']).toEqual({
          order: expect.any(String),
          text: 'Buyer postcode is required for UK addresses',
        });
      });
    });
  });

  describe('If buyer-address !== GBR, town is required', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = { 'buyer-address-country': 'CAN' };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects buyer address', () => {
      it('expects buyer-address-town', () => {
        expect(validationErrors.errorList['buyer-address-town']).toEqual({
          order: expect.any(String),
          text: 'Buyer town is required for non-UK addresses',
        });
      });
    });
  });

  describe('if the supplier is flagged as having a separate correspondence address', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = { 'supplier-correspondence-address-is-different': 'true' };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects supplier correspondence address', () => {
      it('expects supplier-correspondence-address-line-1', () => {
        expect(validationErrors.errorList['supplier-correspondence-address-line-1']).toEqual({
          order: expect.any(String),
          text: 'Supplier correspondence address line 1 is required',
        });
      });

      it('expects supplier-correspondence-address-country', () => {
        expect(validationErrors.errorList['supplier-correspondence-address-country']).toEqual({
          order: expect.any(String),
          text: 'Supplier correspondence country is required',
        });
      });
    });

    describe('If supplier-correspondence-address === GBR, postcode is required', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          'supplier-correspondence-address-is-different': 'true',
          'supplier-correspondence-address-country': 'GBR',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

        validationErrors = body.validationErrors;
      });

      describe('expects supplier correspondence address', () => {
        it('expects supplier-correspondence-address-postcode', () => {
          expect(validationErrors.errorList['supplier-correspondence-address-postcode']).toEqual({
            order: expect.any(String),
            text: 'Supplier correspondence postcode is required for UK addresses',
          });
        });
      });
    });

    describe('If supplier-correspondence-address !== GBR, town is required', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          'supplier-correspondence-address-is-different': 'true',
          'supplier-correspondence-address-country': 'CAN',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

        validationErrors = body.validationErrors;
      });

      describe('expects supplier correspondence address', () => {
        it('expects supplier-correspondence-address-town', () => {
          expect(validationErrors.errorList['supplier-correspondence-address-town']).toEqual({
            order: expect.any(String),
            text: 'Supplier correspondence town is required for non-UK addresses',
          });
        });
      });
    });
  });

  describe('if the guarantor/indemnifier is flagged as being legally distinct from the supplier', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = { legallyDistinct: 'true' };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    it('expects indemnifier-name', () => {
      expect(validationErrors.errorList['indemnifier-name']).toEqual({
        order: expect.any(String),
        text: 'Indemnifier name is required',
      });
    });

    it('expects indemnifierCorrespondenceAddressDifferent', () => {
      expect(validationErrors.errorList.indemnifierCorrespondenceAddressDifferent).toEqual({
        order: expect.any(String),
        text: 'Guarantor/Indemnifier correspondence address is required',
      });
    });

    describe('expects indemnifier address', () => {
      it('expects indemnifier-address-line-1', () => {
        expect(validationErrors.errorList['indemnifier-address-line-1']).toEqual({
          order: expect.any(String),
          text: 'Indemnifier address line 1 is required',
        });
      });

      it('expects indemnifier-address-country', () => {
        expect(validationErrors.errorList['indemnifier-address-country']).toEqual({
          order: expect.any(String),
          text: 'Indemnifier country is required',
        });
      });
    });

    describe('If indemnifier-address === GBR, postcode is required', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          legallyDistinct: 'true',
          'indemnifier-address-country': 'GBR',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

        validationErrors = body.validationErrors;
      });

      describe('expects indemnifier address', () => {
        it('expects indemnifier-address-postcode', () => {
          expect(validationErrors.errorList['indemnifier-address-postcode']).toEqual({
            order: expect.any(String),
            text: 'Indemnifier postcode is required for UK addresses',
          });
        });
      });
    });

    describe('If indemnifier-address !== GBR, town is required', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          legallyDistinct: 'true',
          'indemnifier-address-country': 'CAN',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

        validationErrors = body.validationErrors;
      });

      describe('expects indemnifier address', () => {
        it('expects indemnifier-address-town', () => {
          expect(validationErrors.errorList['indemnifier-address-town']).toEqual({
            order: expect.any(String),
            text: 'Indemnifier town is required for non-UK addresses',
          });
        });
      });
    });
  });

  describe('if the guarantor/indemnifier is flagged as being legally distinct and as having a different correspondence address', () => {
    let validationErrors;

    beforeAll(async () => {
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        legallyDistinct: 'true',
        indemnifierCorrespondenceAddressDifferent: 'true',
      };

      const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

      validationErrors = body.validationErrors;
    });

    describe('expects indemnifier correspondence address', () => {
      it('expects indemnifier-correspondence-address-line-1', () => {
        expect(validationErrors.errorList['indemnifier-correspondence-address-line-1']).toEqual({
          order: expect.any(String),
          text: 'Indemnifier correspondence address line 1 is required',
        });
      });

      it('expects indemnifier-correspondence-address-country', () => {
        expect(validationErrors.errorList['indemnifier-correspondence-address-country']).toEqual({
          order: expect.any(String),
          text: 'Indemnifier correspondence country is required',
        });
      });
    });

    describe('If indemnifier-corresdpondence-address === GBR, postcode is required', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          legallyDistinct: 'true',
          indemnifierCorrespondenceAddressDifferent: 'true',
          'indemnifier-correspondence-address-country': 'GBR',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

        validationErrors = body.validationErrors;
      });

      describe('expects indemnifier correspondence address', () => {
        it('expects indemnifier-correspondence-address-postcode', () => {
          expect(validationErrors.errorList['indemnifier-correspondence-address-postcode']).toEqual({
            order: expect.any(String),
            text: 'Indemnifier correspondence postcode is required for UK addresses',
          });
        });
      });
    });

    describe('If indemnifier-correspondence-address !== GBR, town is required', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          legallyDistinct: 'true',
          indemnifierCorrespondenceAddressDifferent: 'true',
          'indemnifier-correspondence-address-country': 'CAN',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

        validationErrors = body.validationErrors;
      });

      describe('expects indemnifier address', () => {
        it('expects indemnifier-address-town', () => {
          expect(validationErrors.errorList['indemnifier-correspondence-address-town']).toEqual({
            order: expect.any(String),
            text: 'Indemnifier correspondence town is required for non-UK addresses',
          });
        });
      });
    });

    describe('Supply contract value is not correct currency format', () => {
      beforeAll(async () => {
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          supplyContractValue: '12x.34',
        };

        const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);
        validationErrors = body.validationErrors;
      });

      it('expects currency validation message if not in correct format', async () => {
        expect(validationErrors.errorList.supplyContractValue).toEqual({
          order: expect.any(String),
          text: 'Supply Contract value must be in currency format',
        });
      });
    });
  });
});
