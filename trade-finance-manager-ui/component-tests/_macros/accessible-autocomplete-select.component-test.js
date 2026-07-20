const { componentRenderer } = require('../componentRenderer');

const component = '../templates/_macros/accessible-autocomplete-select.njk';
const render = componentRenderer(component);

describe(component, () => {
  const fieldId = 'exporterCreditRatingOther';
  const options = [
    {
      value: 'A+',
      text: 'A+',
      selected: true,
    },
    {
      value: 'BBB',
      text: 'BBB',
    },
  ];

  const getParams = (customConfig = {}) => {
    const defaultConfig = {
      fieldId,
      options,
      inputContainerClasses: 'govuk-form-group govuk-!-width-two-thirds',
    };

    return {
      ...defaultConfig,
      ...customConfig,
    };
  };

  it('should render select with expected id, name and input container classes', () => {
    const wrapper = render(getParams());
    const containerSelector = `[data-cy="accessible-autocomplete-select-${fieldId}"]`;

    wrapper.expectElement(containerSelector).toExist();
    wrapper.expectElement(containerSelector).toHaveAttribute('class', 'govuk-form-group govuk-!-width-two-thirds');
    wrapper.expectElement(`[data-cy="${fieldId}-select"]`).toExist();
    wrapper.expectElement(`[data-cy="${fieldId}-select"][id="${fieldId}"][name="${fieldId}"]`).toExist();
  });

  it('should render disabled and selected placeholder option', () => {
    const wrapper = render(getParams());

    wrapper.expectElement(`[data-cy="${fieldId}-placeholder-option"][value=""][disabled][selected]`).toExist();
  });

  it('should render options and selected option when provided', () => {
    const wrapper = render(getParams());

    wrapper.expectElement('[data-cy="option-A+"]').toExist();
    wrapper.expectText('[data-cy="option-A+"]').toRead('A+');
    wrapper.expectElement('[data-cy="option-A+"][selected]').toExist();

    wrapper.expectElement('[data-cy="option-BBB"]').toExist();
    wrapper.expectText('[data-cy="option-BBB"]').toRead('BBB');
    wrapper.expectElement('[data-cy="option-BBB"][selected]').notToExist();
  });

  it('should render error message with data-cy attribute when error is provided', () => {
    const wrapper = render(
      getParams({
        errorMessage: 'Select a credit rating',
      }),
    );

    wrapper.expectText(`[data-cy="${fieldId}-error-message"]`).toRead('Error: Select a credit rating');
  });

  it('should not render error message when there is no error', () => {
    const wrapper = render(getParams({ errorMessage: undefined }));

    wrapper.expectElement(`[data-cy="${fieldId}-error-message"]`).notToExist();
  });

  it('should render accessible autocomplete script with expected attributes', () => {
    const wrapper = render(getParams());

    const scriptSelector = `[data-cy="${fieldId}-accessible-autocomplete-script"]`;

    wrapper.expectElement(scriptSelector).toExist();
    wrapper.expectElement(scriptSelector).toHaveAttribute('src', '/assets/js/accessibleAutocomplete.js');
    wrapper.expectElement(scriptSelector).toHaveAttribute('type', 'module');
    wrapper.expectElement(scriptSelector).toHaveAttribute('crossorigin', 'anonymous');
  });

  it('should render accessible autocomplete script with the correct integrity attribute', () => {
    const wrapper = render(getParams());
    const scriptSelector = `[data-cy="${fieldId}-accessible-autocomplete-script"]`;
    wrapper
      .expectElement(scriptSelector)
      .toHaveAttribute('integrity', 'sha512-HpHhIJuWO7UgVrJ5F0TShRp7VbXsSC9rusls5dSNUddRBsd1YMZtJc/wVS/9doIpnyYbfp0aT/nd9QgO7Pc9tA==');
  });
});
