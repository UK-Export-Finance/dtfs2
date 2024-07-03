const { componentRenderer } = require('../../componentRenderer');

const component = '../templates/utilisation-reports/_macros/payment-date-input.njk';

const render = componentRenderer(component);

describe(component, () => {
  const aPaymentDate = () => ({
    day: '1',
    month: '1',
    year: '2024',
  });

  const aPaymentDateError = () => ({
    message: 'Some error message',
    dayError: false,
    monthError: false,
    yearError: false,
  });

  const getWrapper = ({ paymentDate, paymentDateError } = {}) =>
    render({
      paymentDate: paymentDate ?? aPaymentDate(),
      paymentDateError: paymentDateError ?? aPaymentDateError(),
    });

  it.each(['paymentDate-day', 'paymentDate-month', 'paymentDate-year'])('should render the %s input', (inputName) => {
    const wrapper = getWrapper();

    wrapper.expectElement(`input[name="${inputName}"]`).toExist();
  });

  it('should render the payment date hint', () => {
    const wrapper = getWrapper();

    wrapper.expectText('div#paymentDate-hint').toRead('For example, 27 03 2023');
  });

  it('should initialise the payment date with the supplied payment date', () => {
    const paymentDate = {
      day: '12',
      month: '13',
      year: '90000',
    };
    const wrapper = getWrapper({ paymentDate });

    wrapper.expectInput('input[name="paymentDate-day"]').toHaveValue('12');
    wrapper.expectInput('input[name="paymentDate-month"]').toHaveValue('13');
    wrapper.expectInput('input[name="paymentDate-year"]').toHaveValue('90000');
  });

  it('should display error message when there is an error with the payment date', () => {
    const paymentDateError = { message: 'That is not a valid date', dayError: true, monthError: false, yearError: true };
    const wrapper = getWrapper({ paymentDateError });

    wrapper.expectText('[id="paymentDate-error"]').toContain('That is not a valid date');
  });

  it.each([
    { inputName: 'paymentDate-day', paymentDateError: { ...aPaymentDateError(), dayError: true } },
    { inputName: 'paymentDate-month', paymentDateError: { ...aPaymentDateError(), monthError: true } },
    { inputName: 'paymentDate-year', paymentDateError: { ...aPaymentDateError(), yearError: true } },
  ])('should add the error class to the $inputName input when there is an error with that field', ({ inputName, paymentDateError }) => {
    const wrapper = getWrapper({ paymentDateError });

    wrapper.expectElement(`input[name="${inputName}"]`).hasClass('govuk-input--error');
  });

  it.each([
    { inputName: 'paymentDate-day', paymentDateError: { ...aPaymentDateError(), dayError: false } },
    { inputName: 'paymentDate-month', paymentDateError: { ...aPaymentDateError(), monthError: false } },
    { inputName: 'paymentDate-year', paymentDateError: { ...aPaymentDateError(), yearError: false } },
  ])('should not add the error class to the $inputName input when there is not an error with that field', ({ inputName, paymentDateError }) => {
    const wrapper = getWrapper({ paymentDateError });

    wrapper.expectElement(`input[name="${inputName}"]`).doesNotHaveClass('govuk-input--error');
  });
});
