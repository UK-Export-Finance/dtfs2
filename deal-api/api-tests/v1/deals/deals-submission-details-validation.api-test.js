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
  let validationErrors;

  beforeAll(async()=>{
    const testUsers = await testUserCache.initialise(app);
    const anHSBCMaker = testUsers().withRole('maker').withBankName('HSBC').one();

    const postResult = await as(anHSBCMaker).post(newDeal).to('/v1/deals');
    const createdDeal = postResult.body;
    const submissionDetails = {};

    const { body } = await as(anHSBCMaker).put(submissionDetails).to(`/v1/deals/${createdDeal._id}/submission-details`);

    validationErrors = body.validationErrors;
  });

  beforeEach(async () => {
    await wipeDB.wipe(['deals']);
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

  describe('supplier address', () => {
    it('expects supplier-address-line-1', () => {
      expect(validationErrors.errorList['supplier-address-line-1']).toEqual({
        order: expect.any(String),
        text: 'Supplier address line 1 is required',
      });
    });

    it('expects supplier-address-line-2', () => {
      expect(validationErrors.errorList['supplier-address-line-2']).toEqual({
        order: expect.any(String),
        text: 'Supplier address line 2 is required',
      });
    });

    it('expects supplier-address-town', () => {
      expect(validationErrors.errorList['supplier-address-town']).toEqual({
        order: expect.any(String),
        text: 'Supplier town is required',
      });
    });

    // companies-house lookup does not provide county, so we can't make it mandatory...
    xit('expects supplier-address-county', () => {
      expect(validationErrors.errorList['supplier-address-county']).toEqual({
        order: expect.any(String),
        text: 'Supplier county is required',
      });
    });

    it('expects supplier-address-postcode', () => {
      expect(validationErrors.errorList['supplier-address-postcode']).toEqual({
        order: expect.any(String),
        text: 'Supplier postcode is required',
      });
    });

    it('expects supplier-address-country', () => {
      expect(validationErrors.errorList['supplier-address-country']).toEqual({
        order: expect.any(String),
        text: 'Supplier country is required',
      });
    });
  })

  describe('supplier correspondence address', () => {
    it('expects supplier-correspondence-address-line-1', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-line-1']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence address line 1 is required',
      });
    });

    it('expects supplier-correspondence-address-line-2', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-line-2']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence address line 2 is required',
      });
    });

    it('expects supplier-correspondence-address-town', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-town']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence town is required',
      });
    });

    // companies-house lookup does not provide county, so we can't make it mandatory...
    xit('expects supplier-correspondence-address-county', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-county']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence county is required',
      });
    });

    it('expects supplier-correspondence-address-postcode', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-postcode']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence postcode is required',
      });
    });

    it('expects supplier-correspondence-address-country', () => {
      expect(validationErrors.errorList['supplier-correspondence-address-country']).toEqual({
        order: expect.any(String),
        text: 'Supplier correspondence country is required',
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

});
