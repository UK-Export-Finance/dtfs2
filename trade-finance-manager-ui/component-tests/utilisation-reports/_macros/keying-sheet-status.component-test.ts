import { KEYING_SHEET_ROW_STATUS, KeyingSheetRowStatus } from '@ukef/dtfs2-common';
import { componentRenderer } from '../../componentRenderer';

const component = '../templates/utilisation-reports/_macros/keying-sheet-status.njk';
const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = (viewModel: { status: KeyingSheetRowStatus; displayStatus: string }) => render(viewModel);

  const statusTagSelector = '[data-cy="keying-sheet-status"]';

  it('displays a tag with the given text', () => {
    // Arrange
    const displayStatus = 'some text';

    // Act
    const wrapper = getWrapper({
      status: 'TO_DO',
      displayStatus,
    });

    // Assert
    wrapper.expectText(statusTagSelector).toRead(displayStatus);
  });

  it.each([
    { status: KEYING_SHEET_ROW_STATUS.TO_DO, expectedColourClass: undefined },
    { status: KEYING_SHEET_ROW_STATUS.DONE, expectedColourClass: 'govuk-tag--green' },
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
