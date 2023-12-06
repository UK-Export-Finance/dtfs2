const componentRenderer = require('../../componentRenderer');
const UTILISATION_REPORT_RECONCILIATION_STATUS = require('../../../server/constants/utilisation-report-reconciliation-status');

const component = '../templates/utilisation-reports/_macros/report-reconciliation-status.njk';
const statusTagSelector = '[data-cy="utilisation-report-reconciliation-status"]';

const render = componentRenderer(component);

describe(component, () => {
  it('displays a tag with the given text', () => {
    // Arrange
    const displayStatus = 'some text';

    // Act
    const wrapper = render({
      statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED,
      displayStatus,
    });

    // Assert
    wrapper.expectText(statusTagSelector).toRead(displayStatus);
  });

  it.each([
    { statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.REPORT_NOT_RECEIVED, expectedColourClass: 'govuk-tag--red' },
    { statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.PENDING_RECONCILIATION, expectedColourClass: undefined },
    { statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_IN_PROGRESS, expectedColourClass: 'govuk-tag--blue' },
    { statusCode: UTILISATION_REPORT_RECONCILIATION_STATUS.RECONCILIATION_COMPLETED, expectedColourClass: 'govuk-tag--green' },
  ])("adds colour class '$expectedColourClass' when the status code is '$statusCode'", ({ statusCode, expectedColourClass }) => {
    // Arrange
    const expectedClass = `govuk-tag${expectedColourClass ? ` ${expectedColourClass}` : ''}`;

    // Act
    const wrapper = render({
      statusCode,
      displayStatus: 'some text',
    });

    // Assert
    wrapper.expectElement(statusTagSelector).toHaveAttribute('class', expectedClass);
  });
});
