const { ROLES } = require('@ukef/dtfs2-common');
const pageRenderer = require('../pageRenderer');
const { PRIMARY_NAV_KEY } = require('../../server/constants');

const page = 'utilisation-report-service/utilisation-report-upload/utilisation-report-upload.njk';
const render = pageRenderer(page);

describe(page, () => {
  const user = {
    firstname: 'John',
    surname: 'Smith',
    roles: [ROLES.PAYMENT_REPORT_OFFICER],
  };
  const dueReportPeriods = [
    {
      start: {
        month: 12,
        year: 2022,
      },
      end: {
        month: 12,
        year: 2022,
      },
      formattedReportPeriod: 'December 2022',
    },
    {
      start: {
        month: 1,
        year: 2023,
      },
      end: {
        month: 1,
        year: 2023,
      },
      formattedReportPeriod: 'January 2023',
    },
    {
      start: {
        month: 2,
        year: 2023,
      },
      end: {
        month: 2,
        year: 2023,
      },
      formattedReportPeriod: 'February 2023',
    },
  ];

  const decemberOverdueReportText = 'December 2022 report is overdue';
  const januaryOverdueReportText = 'January 2023 report is overdue';
  const februaryNowDueReportText = 'February 2023 report is now due';

  describe('when there are 2 reports overdue', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = render({
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods,
      });
    });

    it('should display a generic warning message about reports being overdue', () => {
      wrapper.expectElement('[data-cy="warning-text"]').toExist();
      wrapper.expectText('.govuk-warning-text__text').toMatch(/There are overdue reports, please send them as soon as possible./);
    });

    it('should display the two overdue reports with a specific message', () => {
      wrapper.expectText('[data-cy="list-item-12-2022__overdue"]').toRead(decemberOverdueReportText);
      wrapper.expectText('[data-cy="list-item-1-2023__overdue"]').toRead(januaryOverdueReportText);
    });

    it('should display the current reporting period report being as now due', () => {
      wrapper.expectText('[data-cy="list-item-2-2023__now-due"]').toRead(februaryNowDueReportText);
    });

    it('should display generic inset text about which report needs to be sent', () => {
      wrapper.expectText('[data-cy="inset-text"]').toRead("Once you've sent the December 2022 report, you can send subsequent reports.");
    });

    it('should state which report the page is expecting to be uploaded', () => {
      wrapper.expectText('[data-cy="upload-report-text"]').toMatch(/Upload December 2022 report/);
      wrapper.expectText('[data-cy="upload-report-text"]').toMatch(/The file must be an XLSX or CSV/);
    });
  });

  describe('when there is 1 report overdue', () => {
    let wrapper;
    beforeEach(() => {
      wrapper = render({
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: dueReportPeriods.slice(1),
      });
    });

    it('should display a specific warning message about which reports to upload', () => {
      wrapper.expectElement('[data-cy="warning-text"]').toExist();
      wrapper.expectText('.govuk-warning-text__text').toMatch(/January 2023 report is overdue, please send it as soon as possible./);
    });

    it('should display the one overdue report as being overdue', () => {
      wrapper.expectText('[data-cy="list-item-1-2023__overdue"]').toRead(januaryOverdueReportText);
    });

    it('should display the current reporting period report as being now due', () => {
      wrapper.expectText('[data-cy="list-item-2-2023__now-due"]').toRead(februaryNowDueReportText);
    });

    it('should display specific inset text about which report needs to be sent and which report is now due', () => {
      wrapper.expectText('[data-cy="inset-text"]').toRead("Once you've sent the January 2023 report, you can send the February 2023 report.");
    });

    it('should state which report the page is expecting to be uploaded', () => {
      wrapper.expectText('[data-cy="upload-report-text"]').toMatch(/Upload January 2023 report/);
      wrapper.expectText('[data-cy="upload-report-text"]').toMatch(/The file must be an XLSX or CSV/);
    });
  });

  describe('when only the current reporting period report is due', () => {
    const nextDueReportDueDate = '10 February 2023';
    let wrapper;
    beforeEach(() => {
      wrapper = render({
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: dueReportPeriods.slice(2),
        nextDueReportDueDate,
      });
    });

    it('should not display any warnings about overdue reports', () => {
      wrapper.expectElement('[data-cy="warning-text"]').notToExist();
    });

    it('should display a sub-heading displaying the report period', () => {
      wrapper.expectText('[data-cy="sub-heading"]').toRead('February 2023 report is due');
    });

    it('should display inset text showing the report due date', () => {
      wrapper.expectText('[data-cy="report-due-date"]').toRead(`All issued facilities must be updated and sent to UKEF by ${nextDueReportDueDate}.`);
    });
  });

  describe('when no reports are due', () => {
    const formattedNextReportPeriod = 'March 2023';
    const nextReportPeriodSubmissionStart = '1 April 2023';
    const lastUploadedReportPeriod = 'February 2023';
    const uploadedByFullName = 'John Smith';
    const formattedDateAndTimeUploaded = '25 February 2023 at 10:05 am';
    let wrapper;
    beforeEach(() => {
      wrapper = render({
        user,
        primaryNav: PRIMARY_NAV_KEY.UTILISATION_REPORT_UPLOAD,
        dueReportPeriods: [],
        formattedNextReportPeriod,
        nextReportPeriodSubmissionStart,
        lastUploadedReportPeriod,
        uploadedByFullName,
        formattedDateAndTimeUploaded,
      });
    });

    it('should render the correct heading', () => {
      wrapper.expectText('[data-cy="main-heading"]').toRead('Report not currently due for upload');
    });

    it('should display specific text about the next report which can be uploaded', () => {
      wrapper
        .expectText('[data-cy="next-due-report-text"]')
        .toRead(`The ${formattedNextReportPeriod} report can be uploaded from ${nextReportPeriodSubmissionStart}.`);
    });

    it('should display details about the last uploaded report', () => {
      wrapper
        .expectText('[data-cy="uploaded-report-details"]')
        .toRead(`The ${lastUploadedReportPeriod} report was sent to UKEF by ${uploadedByFullName} on ${formattedDateAndTimeUploaded}.`);
    });

    it('should not render the report submission form', () => {
      wrapper.expectElement('[data-cy="form"]').notToExist();
    });
  });
});
