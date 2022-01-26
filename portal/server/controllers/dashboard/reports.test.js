import { getPortalReports, getUnissuedFacilitiesReport, getUkefDecisionReport } from '.';
import api from '../../api';
import mockResponse from '../../helpers/responseMock';
import CONSTANTS from '../../constants';

jest.mock('../../api');

const defaultUnissuedFacilitiesReportResponse = {
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

const mockUnissuedFacilitiesReportResponse = [
  {
    dealType: CONSTANTS.PRODUCT.BSS_EWCS,
    submissionType: CONSTANTS.SUBMISSION_TYPE.AIN,
    daysLeftToIssue: 16,
    ...defaultUnissuedFacilitiesReportResponse,
  },
  {
    dealType: CONSTANTS.PRODUCT.GEF,
    submissionType: CONSTANTS.SUBMISSION_TYPE.AIN,
    daysLeftToIssue: 10,
    ...defaultUnissuedFacilitiesReportResponse,
  },
  {
    dealType: CONSTANTS.PRODUCT.GEF,
    submissionType: CONSTANTS.SUBMISSION_TYPE.MIN,
    daysLeftToIssue: -10,
    ...defaultUnissuedFacilitiesReportResponse,
  },
];

const mockUkefDecisionReportResponse = [
  {

  },
];

describe('controllers/reports.controller', () => {
  let res;
  const req = { session: { token: 'mock-token', user: '' } };
  beforeEach(() => {
    res = mockResponse();
  });

  describe('getPortalReports', () => {
    it('sets all counts to `0` when there are no unissued facilities and no decisions from UKEF', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue([]);
      api.getUkefDecisionReport.mockResolvedValue([]);
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('reports/reports-dashboard.njk', {
        allUnissuedFacilitiesCount: 0,
        pastDeadlineUnissuedFacilitiesCount: 0,
        facilitiesThatNeedIssuingCount: 0,
        totalUkefDecisions: 0,
        dealWithConditionsCount: 0,
        dealWithoutConditionsCount: 0,
        primaryNav: 'reports',
        user: req.session.user,
      });
    });
    it('sets `allUnissuedFacilitiesCount` to `1` when one facility is unissued', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue([mockUnissuedFacilitiesReportResponse[0]]);
      api.getUkefDecisionReport.mockResolvedValue([]);
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('reports/reports-dashboard.njk', {
        allUnissuedFacilitiesCount: 1,
        pastDeadlineUnissuedFacilitiesCount: 0,
        facilitiesThatNeedIssuingCount: 0,
        totalUkefDecisions: 0,
        dealWithConditionsCount: 0,
        dealWithoutConditionsCount: 0,
        primaryNav: 'reports',
        user: req.session.user,
      });
    });
    it('sets `facilitiesThatNeedIssuingCount` to `1` when one facility needs issuing in less than 15 days', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue([mockUnissuedFacilitiesReportResponse[1]]);
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('reports/reports-dashboard.njk', {
        allUnissuedFacilitiesCount: 1,
        pastDeadlineUnissuedFacilitiesCount: 0,
        facilitiesThatNeedIssuingCount: 1,
        totalUkefDecisions: 0,
        dealWithConditionsCount: 0,
        dealWithoutConditionsCount: 0,
        primaryNav: 'reports',
        user: req.session.user,
      });
    });
    it('sets `pastDeadlineUnissuedFacilitiesCount` to `1` when one facility is overdue', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue([mockUnissuedFacilitiesReportResponse[2]]);
      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('reports/reports-dashboard.njk', {
        allUnissuedFacilitiesCount: 1,
        pastDeadlineUnissuedFacilitiesCount: 1,
        facilitiesThatNeedIssuingCount: 0,
        totalUkefDecisions: 0,
        dealWithConditionsCount: 0,
        dealWithoutConditionsCount: 0,
        primaryNav: 'reports',
        user: req.session.user,
      });
    });

    it('renders all (3) unissued facilities that are overdue or that need issuing in less than 15 days', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue(mockUnissuedFacilitiesReportResponse);

      await getPortalReports(req, res);

      expect(res.render).toHaveBeenCalledWith('reports/reports-dashboard.njk', {
        allUnissuedFacilitiesCount: 3,
        pastDeadlineUnissuedFacilitiesCount: 1,
        facilitiesThatNeedIssuingCount: 1,
        totalUkefDecisions: 0,
        dealWithConditionsCount: 0,
        dealWithoutConditionsCount: 0,
        primaryNav: 'reports',
        user: req.session.user,
      });
    });
  });

  describe('getUnissuedFacilitiesReport', () => {
    it('renders the 404 page if the api call returns `undefined` value', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue();
      await getUnissuedFacilitiesReport(req, res);

      expect(res.redirect).toHaveBeenCalledWith('/not-found');
    });

    it('renders the unissued-facilities report page', async () => {
      api.getUnissuedFacilitiesReport.mockResolvedValue([mockUnissuedFacilitiesReportResponse[1]]);
      await getUnissuedFacilitiesReport(req, res);

      expect(res.render).toHaveBeenCalledWith('reports/unissued-facilities.njk', {
        facilities: [mockUnissuedFacilitiesReportResponse[1]],
        primaryNav: 'reports',
        user: req.session.user,
      });
    });
  });
});
