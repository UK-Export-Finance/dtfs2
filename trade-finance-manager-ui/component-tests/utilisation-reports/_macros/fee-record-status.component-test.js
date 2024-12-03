const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/fee-record-status.njk';
const statusTagSelector = '[data-cy="fee-record-status"]';

const render = componentRenderer(component);

describe(component, () => {
  it('displays a tag with the given text', () => {
    // Arrange
    const displayStatus = 'some text';

    // Act
    const wrapper = render({
      status: FEE_RECORD_STATUS.TO_DO,
      displayStatus,
    });

    // Assert
    wrapper.expectText(statusTagSelector).toRead(displayStatus);
  });

  it.each([
    { status: FEE_RECORD_STATUS.TO_DO, expectedColourClass: undefined },
    { status: FEE_RECORD_STATUS.MATCH, expectedColourClass: 'govuk-tag--green' },
    { status: FEE_RECORD_STATUS.DOES_NOT_MATCH, expectedColourClass: 'govuk-tag--red' },
    { status: FEE_RECORD_STATUS.READY_TO_KEY, expectedColourClass: 'govuk-tag--yellow' },
    { status: FEE_RECORD_STATUS.RECONCILED, expectedColourClass: 'govuk-tag--grey' },
    { status: FEE_RECORD_STATUS.PENDING_CORRECTION, expectedColourClass: 'govuk-tag--yellow' },
  ])("adds colour class '$expectedColourClass' when the status code is '$status'", ({ status, expectedColourClass }) => {
    // Arrange
    const expectedClass = `govuk-tag${expectedColourClass ? ` ${expectedColourClass}` : ''}`;

    // Act
    const wrapper = render({
      status,
      displayStatus: 'some text',
    });

    // Assert
    wrapper.expectElement(statusTagSelector).toHaveAttribute('class', expectedClass);
  });
});
