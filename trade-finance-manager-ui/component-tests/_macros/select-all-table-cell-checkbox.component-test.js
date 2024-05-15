const componentRenderer = require('../componentRenderer');

const component = '../templates/_macros/select-all-table-cell-checkbox.njk';

const render = componentRenderer(component);

describe(component, () => {
  const getWrapper = () => render();

  it("renders a checkbox input with the id 'select-all-checkbox'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('input').toHaveAttribute('id', 'select-all-checkbox');
  });

  it("renders a checkbox input with the class 'hide-if-js-not-enabled'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('input').hasClass('hide-if-js-not-enabled');
  });

  it("renders a checkbox label with the id 'select-all-checkbox-label'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('label').toHaveAttribute('id', 'select-all-checkbox-label');
  });

  it("renders a checkbox label with the class 'hide-if-js-not-enabled'", () => {
    const wrapper = getWrapper();

    wrapper.expectElement('label').hasClass('hide-if-js-not-enabled');
  });
});
