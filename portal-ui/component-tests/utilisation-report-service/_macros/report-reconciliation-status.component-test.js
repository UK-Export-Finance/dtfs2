const {
  REPORT_NOT_RECEIVED,
  PENDING_RECONCILIATION,
  RECONCILIATION_IN_PROGRESS,
  RECONCILIATION_COMPLETED,
  UTILISATION_REPORT_STATUS_TAG_COLOURS,
} = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');

const component = '../templates/utilisation-report-service/previous-reports/_macros/report-reconciliation-status.njk';
const statusTagSelector = '[data-cy="utilisation-report-reconciliation-status"]';

const render = componentRenderer(component);

describe(component, () => {
  it('displays a tag with the given text', () => {
    // Arrange
    const displayStatus = 'some text';

    // Act
    const wrapper = render({
      statusCode: REPORT_NOT_RECEIVED,
      displayStatus,
      statusTagColours: UTILISATION_REPORT_STATUS_TAG_COLOURS,
    });

    // Assert
    wrapper.expectText(statusTagSelector).toRead(displayStatus);
  });

  it.each([
    { status: REPORT_NOT_RECEIVED, expectedColourClass: 'govuk-tag--red' },
    { status: PENDING_RECONCILIATION, expectedColourClass: 'govuk-tag--grey' },
    {
      status: RECONCILIATION_IN_PROGRESS,
      expectedColourClass: 'govuk-tag--blue',
    },
    {
      status: RECONCILIATION_COMPLETED,
      expectedColourClass: 'govuk-tag--green',
    },
  ])("adds colour class '$expectedColourClass' when the status code is '$statusCode'", ({ status, expectedColourClass }) => {
    // Arrange
    const expectedClass = `govuk-tag${expectedColourClass ? ` ${expectedColourClass}` : ''}`;

    // Act
    const wrapper = render({
      status,
      displayStatus: 'some text',
      statusTagColours: UTILISATION_REPORT_STATUS_TAG_COLOURS,
    });

    // Assert
    wrapper.expectElement(statusTagSelector).toHaveAttribute('class', expectedClass);
  });
});
