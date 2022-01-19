import { getPortalReports, getUnissuedFacilitiesReports } from '.';
import api from '../../api';
import mockResponse from '../../helpers/responseMock';
import CONSTANTS from '../../constants';

jest.mock('../../api');

const defaultApiResponse = {
  bankInternalRefName: 'A1 Test',
  companyName: 'Auto Test 1',
  currency: 'GBP',
  currencyAndValue: 'GBP 500,000.00',
  deadlineForIssuing: '18 Apr 2022',
  dealId: '1000000',
  submissionDate: '1642514270823',
  ukefFacilityId: '0030163787',
  value: '500000.00',
};

const resolvedValue = [{
  dealType: CONSTANTS.PRODUCT.BSS_EWCS,
  submissionType: CONSTANTS.SUBMISSION_TYPE.AIN,
  daysLeftToIssue: 16,
  ...defaultApiResponse,
},
{
  dealType: CONSTANTS.PRODUCT.GEF,
  submissionType: CONSTANTS.SUBMISSION_TYPE.AIN,
  daysLeftToIssue: 10,
  ...defaultApiResponse,
},
{
  dealType: CONSTANTS.PRODUCT.GEF,
  submissionType: CONSTANTS.SUBMISSION_TYPE.MIN,
  daysLeftToIssue: -10,
  ...defaultApiResponse,
},
];

describe('controllers/reports.controller', () => {
  let res;
  let req;
  beforeEach(() => {
    res = mockResponse();
  });

  describe('getPortalReports', () => {
    it('sets all counts to `0` when there are no unissued facilities', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue([]);
      req = { session: { token: 'mock-token' } };
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('portal-reports/reports.njk', {
        allUnissuedFacilitiesCount: 0,
        pastDeadlineUnissuedFacilitiesCount: 0,
        facilitiesThatNeedIssuingCount: 0,
      });
    });
    it('sets `allUnissuedFacilitiesCount` to `1` when one facility is unissued', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue([resolvedValue[0]]);
      req = { session: { token: 'mock-token' } };
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('portal-reports/reports.njk', {
        allUnissuedFacilitiesCount: 1,
        pastDeadlineUnissuedFacilitiesCount: 0,
        facilitiesThatNeedIssuingCount: 0,
      });
    });
    it('sets `facilitiesThatNeedIssuingCount` to `1` when one facility needs issuing in less than 15 days', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue([resolvedValue[1]]);
      req = { session: { token: 'mock-token' } };
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('portal-reports/reports.njk', {
        allUnissuedFacilitiesCount: 1,
        pastDeadlineUnissuedFacilitiesCount: 0,
        facilitiesThatNeedIssuingCount: 1,
      });
    });
    it('sets `pastDeadlineUnissuedFacilitiesCount` to `1` when one facility is overdue', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue([resolvedValue[2]]);
      req = { session: { token: 'mock-token' } };
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('portal-reports/reports.njk', {
        allUnissuedFacilitiesCount: 1,
        pastDeadlineUnissuedFacilitiesCount: 1,
        facilitiesThatNeedIssuingCount: 0,
      });
    });

    it('renders all (3) unissued facilities that are overdue or that need issuing in less than 15 days', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue(resolvedValue);
      req = { session: { token: 'mock-token' } };
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('portal-reports/reports.njk', {
        allUnissuedFacilitiesCount: 3,
        pastDeadlineUnissuedFacilitiesCount: 1,
        facilitiesThatNeedIssuingCount: 1,
      });
    });
  });

  describe('getUnissuedFacilitiesReports', () => {
    it('renders the 404 page if the api call returns `undefined` value', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue();
      req = { session: { token: 'mock-token' } };
      await getUnissuedFacilitiesReports(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('renders the unissued-facilities report page', async () => {
      api.getUnissuedFacilitiesReports.mockResolvedValue([resolvedValue[1]]);
      req = { session: { token: 'mock-token' } };
      await getUnissuedFacilitiesReports(req, res);

      expect(res.render).toHaveBeenCalledWith('portal-reports/unissued-facilities.njk', { facilities: [resolvedValue[1]] });
    });
  });
});
