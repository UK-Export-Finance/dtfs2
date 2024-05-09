const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
require('dotenv').config();

const api = require('./api');

const { PORTAL_API_URL } = process.env;

describe('api', () => {
  const mock = new MockAdapter(axios);

  const invalidId1 = '../../../etc/passwd';
  const invalidId2 = '127.0.0.1';
  const invalidId3 = {};
  const invalidId4 = [];
  const validId = '620a1aa095a618b12da38c7b';

  describe('updateDealName', () => {
    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.updateDealName(invalidId1);

      expect(response.status).toEqual(400);
    });

    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.updateDealName(invalidId2);

      expect(response.status).toEqual(400);
    });

    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.updateDealName(invalidId3);

      expect(response.status).toEqual(400);
    });

    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.updateDealName(invalidId4);

      expect(response.status).toEqual(400);
    });

    it('should return a status of 200 when a valid id is provided', async () => {
      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/additionalRefName`).reply(200, {});

      const response = await api.updateDealName(validId, 'test', '');

      expect(response.status).toEqual(200);
    });
  });

  describe('getSubmissionDetails', () => {
    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.getSubmissionDetails(invalidId1, '');

      expect(response.status).toEqual(400);
    });

    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.getSubmissionDetails(invalidId2, '');

      expect(response.status).toEqual(400);
    });

    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.getSubmissionDetails(invalidId3, '');

      expect(response.status).toEqual(400);
    });

    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.getSubmissionDetails(invalidId4, '');

      expect(response.status).toEqual(400);
    });

    it('should return a status of 200 when a valid id is provided', async () => {
      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}/submission-details`).reply(200, {});

      const response = await api.getSubmissionDetails(validId, '');

      expect(response.status).toEqual(200);
    });
  });

  describe('cloneDeal', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.cloneDeal(invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.cloneDeal(invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.cloneDeal(invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.cloneDeal(invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPost(`${PORTAL_API_URL}/v1/deals/${validId}/clone`).reply(200, responseObject);

      const response = await api.cloneDeal(validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateEligibilityCriteria', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityCriteria(invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityCriteria(invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityCriteria(invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityCriteria(invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/eligibility-criteria`).reply(200, responseObject);

      const response = await api.updateEligibilityCriteria(validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateEligibilityDocumentation', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityDocumentation(invalidId1, {}, [], '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityDocumentation(invalidId2, {}, [], '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityDocumentation(invalidId3, {}, [], '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.updateEligibilityDocumentation(invalidId4, {}, [], '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/eligibility-documentation`).reply(200, responseObject);

      const response = await api.updateEligibilityDocumentation(validId, {}, [], '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('createLoan', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.createLoan(invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.createLoan(invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.createLoan(invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.createLoan(invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/loan/create`).reply(200, responseObject);

      const response = await api.createLoan(validId, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('getLoan', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.getLoan(invalidId1, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.getLoan(invalidId2, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.getLoan(invalidId3, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.getLoan(invalidId4, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.getLoan(validId, invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.getLoan(validId, invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.getLoan(validId, invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.getLoan(validId, invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}/loan/${validId}`).reply(200, responseObject);

      const response = await api.getLoan(validId, validId, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateLoan', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoan(invalidId1, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoan(invalidId2, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoan(invalidId3, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoan(invalidId4, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoan(validId, invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoan(validId, invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoan(validId, invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoan(validId, invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/loan/${validId}`).reply(200, responseObject);

      const response = await api.updateLoan(validId, validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateLoanIssueFacility', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanIssueFacility(invalidId1, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanIssueFacility(invalidId2, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanIssueFacility(invalidId3, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanIssueFacility(invalidId4, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanIssueFacility(validId, invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanIssueFacility(validId, invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanIssueFacility(validId, invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanIssueFacility(validId, invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/loan/${validId}/issue-facility`).reply(200, responseObject);

      const response = await api.updateLoanIssueFacility(validId, validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateLoanCoverStartDate', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(invalidId1, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(invalidId2, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(invalidId3, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(invalidId4, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(validId, invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(validId, invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(validId, invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(validId, invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/loan/${validId}/change-cover-start-date`).reply(200, responseObject);

      const response = await api.updateLoanCoverStartDate(validId, validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('deleteLoan', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteLoan(invalidId1, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteLoan(invalidId2, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteLoan(invalidId3, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteLoan(invalidId4, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteLoan(validId, invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteLoan(validId, invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteLoan(validId, invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteLoan(validId, invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onDelete(`${PORTAL_API_URL}/v1/deals/${validId}/loan/${validId}`).reply(200, responseObject);

      const response = await api.deleteLoan(validId, validId, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('createBond', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.createBond(invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.createBond(invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.createBond(invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.createBond(invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/bond/create`).reply(200, responseObject);

      const response = await api.createBond(validId, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('contractBond', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.contractBond(invalidId1, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.contractBond(invalidId2, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.contractBond(invalidId3, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.contractBond(invalidId4, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.contractBond(validId, invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.contractBond(validId, invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.contractBond(validId, invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.contractBond(validId, invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}/bond/${validId}`).reply(200, responseObject);

      const response = await api.contractBond(validId, validId, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateBond', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBond(invalidId1, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBond(invalidId2, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBond(invalidId3, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBond(invalidId4, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBond(validId, invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBond(validId, invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBond(validId, invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBond(validId, invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/bond/${validId}`).reply(200, responseObject);

      const response = await api.updateBond(validId, validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateBondIssueFacility', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondIssueFacility(invalidId1, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondIssueFacility(invalidId2, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondIssueFacility(invalidId3, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondIssueFacility(invalidId4, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondIssueFacility(validId, invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondIssueFacility(validId, invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondIssueFacility(validId, invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondIssueFacility(validId, invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/bond/${validId}/issue-facility`).reply(200, responseObject);

      const response = await api.updateBondIssueFacility(validId, validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('updateBondCoverStartDate', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondCoverStartDate(invalidId1, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondCoverStartDate(invalidId2, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondCoverStartDate(invalidId3, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.updateBondCoverStartDate(invalidId4, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondCoverStartDate(validId, invalidId1, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondCoverStartDate(validId, invalidId2, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondCoverStartDate(validId, invalidId3, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondCoverStartDate(validId, invalidId4, {}, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onPut(`${PORTAL_API_URL}/v1/deals/${validId}/bond/${validId}/change-cover-start-date`).reply(200, responseObject);

      const response = await api.updateBondCoverStartDate(validId, validId, {}, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('deleteBond', () => {
    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteBond(invalidId1, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteBond(invalidId2, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteBond(invalidId3, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid dealId is provided', async () => {
      const response = await api.deleteBond(invalidId4, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteBond(validId, invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteBond(validId, invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteBond(validId, invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteBond(validId, invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onDelete(`${PORTAL_API_URL}/v1/deals/${validId}/bond/${validId}`).reply(200, responseObject);

      const response = await api.deleteBond(validId, validId, '');

      expect(response).toEqual(responseObject);
    });
  });

  describe('getDeal', () => {
    it('should return a status of 400 when an invalid id is provided', async () => {
      const response = await api.getDeal(invalidId1, '');

      expect(response.status).toEqual(400);
    });

    it('should return a status of 400 when an invalid id is provided', async () => {
      const response = await api.getDeal(invalidId2, '');

      expect(response.status).toEqual(400);
    });

    it('should return a status of 400 when an invalid id is provided', async () => {
      const response = await api.getDeal(invalidId3, '');

      expect(response.status).toEqual(400);
    });

    it('should return a status of 400 when an invalid id is provided', async () => {
      const response = await api.getDeal(invalidId4, '');

      expect(response.status).toEqual(400);
    });

    it('should return a response of 200 when a valid id is provided', async () => {
      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}`).reply(200, {});

      const response = await api.getDeal(validId, '');

      expect(response.status).toEqual(200);
    });
  });

  describe('downloadEligibilityDocumentationFile', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.downloadEligibilityDocumentationFile(invalidId1, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.downloadEligibilityDocumentationFile(invalidId2, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.downloadEligibilityDocumentationFile(invalidId3, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid id is provided', async () => {
      const response = await api.downloadEligibilityDocumentationFile(invalidId4, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}/eligibility-documentation/exporterQuestionnaire/document.txt`).reply(200, responseObject);

      const response = await api.downloadEligibilityDocumentationFile(validId, 'exporterQuestionnaire', 'document.txt', '');

      expect(response).toEqual(responseObject);
    });
  });
});
