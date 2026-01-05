const pageRenderer = require('../../pageRenderer');
const { aPendingCorrectionsViewModel } = require('../../../test-helpers/test-data/view-models');

const page = 'utilisation-report-service/record-correction/pending-corrections.njk';
const render = pageRenderer(page);

describe(page, () => {
  it('should render the main heading', () => {
    // Act
    const wrapper = render(aPendingCorrectionsViewModel());

    // Assert
    wrapper.expectText('[data-cy="main-heading"]').toRead('Report GEF utilisation and fees');
  });

  it('should render the corrections info text', () => {
    // Arrange
    const viewModel = {
      ...aPendingCorrectionsViewModel(),
      formattedReportPeriod: 'December 2035',
      uploadedByFullName: 'John Doe',
      formattedDateUploaded: '1 January 2036',
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    const expected = `The following errors in the ${viewModel.formattedReportPeriod} report uploaded by ${viewModel.uploadedByFullName} on ${viewModel.formattedDateUploaded} have been identified by UKEF:`;
    wrapper.expectText('[data-cy="corrections-info-text"]').toRead(expected);
  });

  it('should render the corrections heading and selection text', () => {
    // Act
    const wrapper = render(aPendingCorrectionsViewModel());

    // Assert
    wrapper.expectText('[data-cy="pending-corrections-heading"]').toRead('Record correction');
    wrapper.expectText('[data-cy="selection-text"]').toRead('Select the record you would like to amend from the list below');
  });

  describe('when there is a report currently due for upload', () => {
    const nextDueReport = 'March 2036';
    const correctionsReportPeriod = 'December 2035';
    const viewModel = {
      ...aPendingCorrectionsViewModel(),
      formattedReportPeriod: correctionsReportPeriod,
      nextAction: {
        reportCurrentlyDueForUpload: {
          formattedReportPeriod: nextDueReport,
        },
      },
    };

    it('should render the next report due for upload heading', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="next-report-due-heading"]').toRead(`${nextDueReport} report`);
    });

    it('should render the next report due for upload text', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      const expected = `The ${nextDueReport} report is due, but cannot be uploaded until the record corrections for the ${correctionsReportPeriod} have been completed.`;
      wrapper.expectText('[data-cy="next-report-due-text"]').toRead(expected);
    });

    it('should not render the no report due for upload heading', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="no-report-due-heading"]').notToExist();
    });

    it('should not render the no report due for upload text', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="no-report-due-text"]').notToExist();
    });
  });

  describe('when there is not a report currently due for upload', () => {
    const nextDueReport = 'March 2036';
    const nextDueReportUploadFromDate = '1 April 2036';
    const viewModel = {
      ...aPendingCorrectionsViewModel(),
      nextAction: {
        reportSoonToBeDueForUpload: {
          formattedReportPeriod: nextDueReport,
          formattedUploadFromDate: nextDueReportUploadFromDate,
        },
      },
    };

    it('should render the no report due for upload heading', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectText('[data-cy="no-report-due-heading"]').toRead('Report not currently due for upload');
    });

    it('should render the no report due for upload text', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      const expected = `The ${nextDueReport} report can be uploaded from ${nextDueReportUploadFromDate}`;
      wrapper.expectText('[data-cy="no-report-due-text"]').toRead(expected);
    });

    it('should not render the next report due for upload heading', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="next-report-due-heading"]').notToExist();
    });

    it('should not render the next report due for upload text', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="next-report-due-text"]').notToExist();
    });
  });

  describe('when there are corrections', () => {
    const firstCorrection = {
      correctionId: 1,
      facilityId: '1111',
      exporter: 'Exporter 1',
      // Test newlines are converted to <br>
      additionalInfo: 'Line 1\nLine 2',
      formattedReasons: 'Reason 1, Other',
      formattedReportedFees: 'USD 1,000.00',
    };
    const secondCorrection = {
      correctionId: 2,
      facilityId: '2222',
      exporter: 'Exporter 2',
      // Test <br> tags in input are not rendered as <br>
      additionalInfo: 'Should not render <br> here',
      formattedReasons: 'Reason 2',
      formattedReportedFees: 'JPY 10,000.00',
    };
    const viewModel = {
      ...aPendingCorrectionsViewModel(),
      corrections: [firstCorrection, secondCorrection],
    };

    const firstRowSelector = 'tr:nth-of-type(1)';
    const secondRowSelector = 'tr:nth-of-type(2)';

    it('should render the pending corrections table', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('[data-cy="pending-corrections-table"]').toExist();
    });

    it('should render the corrections table headers', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('th').toHaveCount(5);
      wrapper.expectElement('th:contains("Facility ID")').toExist();
      wrapper.expectElement('th:contains("Exporter")').toExist();
      wrapper.expectElement('th:contains("Reported fees paid")').toExist();
      wrapper.expectElement('th:contains("Error type(s)")').toExist();
      wrapper.expectElement('th:contains("Error summary")').toExist();
    });

    it('should render the corrections as rows within the table', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper.expectElement('tr').toHaveCount(3); // 2 corrections + 1 header row

      wrapper.expectText(`${firstRowSelector} [data-cy="pending-corrections-row--facility-id"]`).toRead(firstCorrection.facilityId);
      wrapper.expectText(`${firstRowSelector} [data-cy="pending-corrections-row--exporter"]`).toRead(firstCorrection.exporter);
      wrapper.expectText(`${firstRowSelector} [data-cy="pending-corrections-row--reported-fees-paid"]`).toRead(firstCorrection.formattedReportedFees);
      wrapper.expectText(`${firstRowSelector} [data-cy="pending-corrections-row--error-type"]`).toRead(firstCorrection.formattedReasons);

      wrapper.expectText(`${firstRowSelector} [data-cy="pending-corrections-row--error-summary"]`).toRead('Line 1Line 2');

      wrapper.expectText(`${secondRowSelector} [data-cy="pending-corrections-row--error-summary"]`).toRead('Should not render  here');

      wrapper.expectText(`${secondRowSelector} [data-cy="pending-corrections-row--facility-id"]`).toRead(secondCorrection.facilityId);
      wrapper.expectText(`${secondRowSelector} [data-cy="pending-corrections-row--exporter"]`).toRead(secondCorrection.exporter);
      wrapper.expectText(`${secondRowSelector} [data-cy="pending-corrections-row--reported-fees-paid"]`).toRead(secondCorrection.formattedReportedFees);
      wrapper.expectText(`${secondRowSelector} [data-cy="pending-corrections-row--error-type"]`).toRead(secondCorrection.formattedReasons);
    });

    it('should render the facility ids of the corrections as links to the provide correction page', () => {
      // Act
      const wrapper = render(viewModel);

      // Assert
      wrapper
        .expectLink(`${firstRowSelector} [data-cy="pending-corrections-row--facility-id"] [data-cy="correction-link"]`)
        .toLinkTo(`/utilisation-reports/provide-correction/${firstCorrection.correctionId}`, firstCorrection.facilityId);
      wrapper
        .expectLink(`${secondRowSelector} [data-cy="pending-corrections-row--facility-id"] [data-cy="correction-link"]`)
        .toLinkTo(`/utilisation-reports/provide-correction/${secondCorrection.correctionId}`, secondCorrection.facilityId);
    });
  });
});
