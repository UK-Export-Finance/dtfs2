const { FEE_RECORD_STATUS } = require('@ukef/dtfs2-common');
const componentRenderer = require('../../componentRenderer');

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
    { status: FEE_RECORD_STATUS.TO_DO, expectedColourClass: 'govuk-tag--blue' },
  ])("adds colour class '$expectedColourClass' when the status code is '$statusCode'", ({ status, expectedColourClass }) => {
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
