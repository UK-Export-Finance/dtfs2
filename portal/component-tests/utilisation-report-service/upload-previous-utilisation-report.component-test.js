const pageRenderer = require('../pageRenderer');
const { PAYMENT_REPORT_OFFICER } = require('../../server/constants/roles');

const page = 'utilisation-report-service/utilisation-report-upload/upload-previous-utilisation-reports.njk';
const render = pageRenderer(page);

describe(page, () => {
  const user = {
    firstname: 'John',
    surname: 'Smith',
    roles: [PAYMENT_REPORT_OFFICER],
  };
  const reportPeriod = 'February 2023';
  const dueReportsWithTwoOverdue = [{
    year: 2022,
    month: 'December',
  }, {
    year: 2023,
    month: 'January',
  }, {
    year: 2023,
    month: 'February',
  }];
  const dueReportsWithOneOverdue = dueReportsWithTwoOverdue.slice(1);

  const decemberOverdueReportText = 'December 2022 report is overdue';
  const januaryOverdueReportText = 'January 2023 report is overdue';
  const februaryNowDueReportText = 'February 2023 report is now due';

  describe('when there are 2 reports overdue', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = render({
        user,
        primaryNav: 'utilisation_report_upload',
        reportPeriod,
        dueReports: dueReportsWithTwoOverdue,
      });
    });

    it('should display a generic warning message about reports being overdue', () => {
      wrapper.expectElement('[data-cy="warning-text"]').toExist();
      wrapper.expectText('.govuk-warning-text__text').toMatch(/[There are overdue reports, please send them as soon as possible.]/);
    });

    it('should display the two overdue reports with a specific message', () => {
      wrapper.expectText('[data-cy="list-item-December-2022__overdue"]').toRead(decemberOverdueReportText);
      wrapper.expectText('[data-cy="list-item-January-2023__overdue"]').toRead(januaryOverdueReportText);
    });

    it('should display the current reporting period report being as now due', () => {
      wrapper.expectText('[data-cy="list-item-February-2023__now-due"]').toRead(februaryNowDueReportText);
    });

    it('should display inset text about ', () => {
      wrapper.expectText('[data-cy="inset-text"]')
        .toRead("Once you've sent the December 2022 report, you can send subsequent reports.");
    });

    it('should state which report the page is expecting to be uploaded', () => {
      wrapper.expectText('[data-cy="upload-report-text"]').toRead('Upload December 2022 report');
    });
  });

  describe('when there is 1 report overdue', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = render({
        user,
        primaryNav: 'utilisation_report_upload',
        reportPeriod,
        dueReports: dueReportsWithOneOverdue,
      });
    });

    it('should display a specific warning message about which reports to upload', () => {
      wrapper.expectElement('[data-cy="warning-text"]').toExist();
      wrapper.expectText('.govuk-warning-text__text').toMatch(/[January 2023 report is overdue, please send it as soon as possible.]/);
    });

    it('should display the one overdue report as being overdue', () => {
      wrapper.expectText('[data-cy="list-item-January-2023__overdue"]').toRead(januaryOverdueReportText);
    });

    it('should display the current reporting period report as being now due', () => {
      wrapper.expectText('[data-cy="list-item-February-2023__now-due"]').toRead(februaryNowDueReportText);
    });

    it('should display inset text about ', () => {
      wrapper.expectText('[data-cy="inset-text"]')
        .toRead("Once you've sent the January 2023 report, you can send the February 2023 report.");
    });

    it('should state which report the page is expecting to be uploaded', () => {
      wrapper.expectText('[data-cy="upload-report-text"]').toRead('Upload January 2023 report');
    });
  });
});
