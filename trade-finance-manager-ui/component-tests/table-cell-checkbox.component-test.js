const { componentRenderer } = require('./componentRenderer');

const component = '../templates/_macros/table-cell-checkbox.njk';

const render = componentRenderer(component);

describe(component, () => {
  it('should render the checkbox with the correct id', () => {
    // Arrange
    const params = {
      checkboxId: 'abc123',
      label: '<div></div>',
    };

    // Act
    const wrapper = render(params);

    // Assert
    wrapper.expectElement('div.govuk-checkboxes').toExist();
    wrapper.expectElement('input.govuk-checkboxes__input').toHaveAttribute('id', 'abc123');
  });

  it('should render the correct label inside the checkbox', () => {
    // Arrange
    const label = '<p id="i-am-here"></p>';
    const params = {
      checkboxId: 'abc123',
      label,
    };

    // Act
    const wrapper = render(params);

    // Assert
    wrapper.expectElement('label.govuk-checkboxes__label > p').toHaveAttribute('id', 'i-am-here');
  });
});
