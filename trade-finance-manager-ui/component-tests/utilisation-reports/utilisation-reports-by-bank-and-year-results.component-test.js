const { pageRenderer } = require('../pageRenderer');
const { MOCK_TFM_SESSION_USER } = require('../../server/test-mocks/mock-tfm-session-user');
const { PRIMARY_NAVIGATION_KEYS } = require('../../server/constants');

const page = '../templates/utilisation-reports/utilisation-reports-by-bank-and-year-results.njk';
const render = pageRenderer(page);

describe(page, () => {
  const bankName = 'Barclays';
  const year = '2024';
  const mockReports = [
    {
      reportId: '1',
      formattedReportPeriod: 'Nov 2024',
      displayStatus: 'Report Completed',
      formattedDateUploaded: '12 Dec 2024',
    },
  ];

  const getWrapper = ({ reports } = { reports: mockReports }) => {
    const params = {
      user: MOCK_TFM_SESSION_USER,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bankName,
      year,
      reports,
    };
    return render(params);
  };

  it('should render the main heading', () => {
    getWrapper().expectText('[data-cy="utilisation-reports-by-bank-and-year-heading"]').toRead(`${bankName} ${year} reports`);
  });

  it("should render 'No reports found' text when reports is empty", () => {
    getWrapper({ reports: [] }).expectText('[data-cy="utilisation-reports-by-bank-and-year-text"]').toContain('No reports found.');
  });

  it('should render table when reports is not empty', () => {
    getWrapper().expectElement('[data-cy="utilisation-reports-by-bank-and-year-table"]').toExist();
  });
});
