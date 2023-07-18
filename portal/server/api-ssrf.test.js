const MockAdapter = require('axios-mock-adapter');
const axios = require('axios');
require('dotenv').config();

const api = require('./api');

const { PORTAL_API_URL } = process.env;

describe('api', () => {
  const mock = new MockAdapter(axios);

  const invalidId = '../../../etc/passwd';
  const validId = '620a1aa095a618b12da38c7b';

  describe('updateDealName', () => {
    it('should return status of 400 when an invalid id is provided', async () => {
      const response = await api.updateDealName(invalidId);

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
      const response = await api.getSubmissionDetails(invalidId, '');

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
      const response = await api.cloneDeal(invalidId, {}, '');

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
      const response = await api.updateEligibilityCriteria(invalidId, {}, '');

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
      const response = await api.updateEligibilityDocumentation(invalidId, {}, [], '');

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
      const response = await api.createLoan(invalidId, '');

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
      const response = await api.getLoan(invalidId, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.getLoan(validId, invalidId, '');

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
      const response = await api.updateLoan(invalidId, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoan(validId, invalidId, {}, '');

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
      const response = await api.updateLoanIssueFacility(invalidId, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanIssueFacility(validId, invalidId, {}, '');

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
      const response = await api.updateLoanCoverStartDate(invalidId, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateLoanCoverStartDate(validId, invalidId, {}, '');

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
      const response = await api.deleteLoan(invalidId, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteLoan(validId, invalidId, '');

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
      const response = await api.createBond(invalidId, '');

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
      const response = await api.contractBond(invalidId, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.contractBond(validId, invalidId, '');

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
      const response = await api.updateBond(invalidId, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBond(validId, invalidId, {}, '');

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
      const response = await api.updateBondIssueFacility(invalidId, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondIssueFacility(validId, invalidId, {}, '');

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
      const response = await api.updateBondCoverStartDate(invalidId, validId, {}, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.updateBondCoverStartDate(validId, invalidId, {}, '');

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
      const response = await api.deleteBond(invalidId, validId, '');

      expect(response).toEqual(false);
    });

    it('should return false when an invalid loanId is provided', async () => {
      const response = await api.deleteBond(validId, invalidId, '');

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
      const response = await api.getDeal(invalidId, '');

      expect(response.status).toEqual(400);
    });

    it('should return a response of 200 when a valid id is provided', async () => {
      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}`).reply(200, {});

      const response = await api.getDeal(validId, '');

      expect(response.status).toEqual(200);
    });
  });

  describe('downloadFile', () => {
    it('should return false when an invalid id is provided', async () => {
      const response = await api.downloadFile(invalidId, '');

      expect(response).toEqual(false);
    });

    it('should return the response object when a valid id is provided', async () => {
      const responseObject = { a: 'a' };

      mock.onGet(`${PORTAL_API_URL}/v1/deals/${validId}/eligibility-documentation/test/test`).reply(200, responseObject);

      const response = await api.downloadFile(validId, 'test', 'test', '');

      expect(response).toEqual(responseObject);
    });
  });
});
