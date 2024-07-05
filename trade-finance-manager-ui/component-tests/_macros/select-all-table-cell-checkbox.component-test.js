const { componentRenderer } = require('../componentRenderer');

const component = '../templates/_macros/select-all-table-cell-checkbox.njk';

const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = () => render();

  it("renders a checkbox input with the id 'select-all-checkbox'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('input[type="checkbox"]').toHaveAttribute('id', 'select-all-checkbox');
  });

  it("renders a checkbox label with the id 'select-all-checkbox-label'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('label').toHaveAttribute('id', 'select-all-checkbox-label');
  });

  it("sets the aria-label to 'Select all'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('input[type="checkbox"]').toHaveAttribute('aria-label', 'Select all');
  });
});
