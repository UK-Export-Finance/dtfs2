const componentRenderer = require('../../../componentRenderer');

const component = 'utilisation-report-service/record-correction/_macros/correction-request-details-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  it('should render the current record details table', () => {
    // Arrange
    const facilityId = '12345678';
    const exporter = 'An exporter';
    const formattedReportedFees = 'GBP 77';
    const formattedReasons = 'Reason 1, Reason 2';
    const additionalInfo = 'Some additional info';
    const errorTypeHeader = 'Error types';

    const viewModel = {
      details: {
        facilityId,
        exporter,
        formattedReportedFees,
        formattedReasons,
        additionalInfo,
        errorTypeHeader,
      },
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('[data-cy="correction-request-details-table"]').toExist();

    wrapper.expectText('[data-cy="correction-request-details-table-header--error-type"]').toRead(errorTypeHeader);

    wrapper.expectText('[data-cy="correction-request-details-table--facility-id"]').toRead(facilityId);
    wrapper.expectText('[data-cy="correction-request-details-table--exporter"]').toRead(exporter);
    wrapper.expectText('[data-cy="correction-request-details-table--reported-fees"]').toRead(formattedReportedFees);
    wrapper.expectText('[data-cy="correction-request-details-table--formatted-reasons"]').toRead(formattedReasons);
    wrapper.expectText('[data-cy="correction-request-details-table--additional-info"]').toRead(additionalInfo);
  });

  it('should render the "error summary" text with line breaks', () => {
    // Arrange
    const additionalInfoWithLineBreaks = 'First line\n\nAnother line after some spacing';
    const viewModel = {
      details: {
        additionalInfo: additionalInfoWithLineBreaks,
      },
    };

    const expectedContent = 'First line<br><br>Another line after some spacing';

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('[data-cy="correction-request-details-table--additional-info"]').toHaveHtmlContent(expectedContent);
  });
});
