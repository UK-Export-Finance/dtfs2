const wipeDB = require('../../wipeDB');
const aDeal = require('./deal-builder');

const app = require('../../../src/createApp');
const testUserCache = require('../../api-test-users');

const { as } = require('../../api')(app);
const { expectAddedFields, expectAllAddedFields } = require('./expectAddedFields');

const newDeal = aDeal({
  details: {
    bankSupplyContractName: 'mock name',
    bankSupplyContractID: 'mock id',
    status: "Draft",
    dateOfLastAction: '1985/11/04 21:00:00:000',
  },
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

  beforeAll(async()=>{
    const testUsers = await testUserCache.initialise(app);
    anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
  });

  describe('For all cases', () => {
    let validationErrors;

    beforeAll(async()=>{
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
    })

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
    })


  });

  describe('If supplier-address === GBR, postcode is required', () => {
    let validationErrors;

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {'supplier-address-country':'GBR'};

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

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {'supplier-address-country':'USA'};

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

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {'buyer-address-country':'GBR'};

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

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {'buyer-address-country':'USA'};

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

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {"supplier-correspondence-address-is-different":"true"};

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
      let validationErrors;

      beforeAll(async()=>{
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          "supplier-correspondence-address-is-different":"true",
          "supplier-correspondence-address-country":"GBR"
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
      let validationErrors;

      beforeAll(async()=>{
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          "supplier-correspondence-address-is-different":"true",
          "supplier-correspondence-address-country":"USA"
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

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {"legallyDistinct":"true"};

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
      expect(validationErrors.errorList['indemnifierCorrespondenceAddressDifferent']).toEqual({
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
      let validationErrors;

      beforeAll(async()=>{
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          "legallyDistinct":"true",
          "indemnifier-address-country":"GBR"
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
      let validationErrors;

      beforeAll(async()=>{
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          "legallyDistinct":"true",
          "indemnifier-address-country":"USA"
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

    beforeAll(async()=>{
      const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
      const createdDeal = postResult.body;
      const submissionDetails = {
        "legallyDistinct":"true",
        "indemnifierCorrespondenceAddressDifferent":"true",
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
      let validationErrors;

      beforeAll(async()=>{
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          "legallyDistinct":"true",
          "indemnifierCorrespondenceAddressDifferent":"true",
          "indemnifier-correspondence-address-country":"GBR"
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
      let validationErrors;

      beforeAll(async()=>{
        const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
        const createdDeal = postResult.body;
        const submissionDetails = {
          "legallyDistinct":"true",
          "indemnifierCorrespondenceAddressDifferent":"true",
          "indemnifier-correspondence-address-country":"USA"
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

  });

});
