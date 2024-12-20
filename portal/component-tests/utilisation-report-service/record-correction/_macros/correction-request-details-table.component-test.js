const componentRenderer = require('../../../componentRenderer');

const component = 'utilisation-report-service/record-correction/_macros/correction-request-details-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  const facilityId = '12345678';
  const exporter = 'An exporter';
  const formattedReportedFees = 'GBP 77';
  const formattedReasons = 'Reason 1, Reason 2';
  const additionalInfo = 'Some additional info';

  it('should render the current record details table', () => {
    // Arrange
    const viewModel = {
      details: {
        facilityId,
        exporter,
        formattedReportedFees,
        formattedReasons,
        additionalInfo,
      },
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectElement('[data-cy="correction-request-details-table"]').toExist();

    wrapper.expectText('[data-cy="correction-request-details-table--facility-id"]').toRead(facilityId);
    wrapper.expectText('[data-cy="correction-request-details-table--exporter"]').toRead(exporter);
    wrapper.expectText('[data-cy="correction-request-details-table--reported-fees"]').toRead(formattedReportedFees);
    wrapper.expectText('[data-cy="correction-request-details-table--formatted-reasons"]').toRead(formattedReasons);
    wrapper.expectText('[data-cy="correction-request-details-table--additional-info"]').toRead(additionalInfo);
  });

  it('should render singular "Error type" table header when there is only one error reason', () => {
    // Arrange
    const viewModel = {
      details: {
        facilityId,
        exporter,
        formattedReportedFees,
        reasons: ['Reason 1'],
        formattedReasons: 'Reason 1',
        additionalInfo,
      },
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('[data-cy="correction-request-details-table-header--error-type"]').toRead('Error type');
  });

  it('should render plural "Error types" table header when there is more than one error reason', () => {
    // Arrange
    const viewModel = {
      details: {
        facilityId,
        exporter,
        formattedReportedFees,
        reasons: ['Reason 1', 'Reason 2'],
        formattedReasons: 'Reason 1, Reason 2',
        additionalInfo,
      },
    };

    // Act
    const wrapper = render(viewModel);

    // Assert
    wrapper.expectText('[data-cy="correction-request-details-table-header--error-type"]').toRead('Error types');
  });
});
