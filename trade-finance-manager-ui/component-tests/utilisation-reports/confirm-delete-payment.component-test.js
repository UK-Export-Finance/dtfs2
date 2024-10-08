const { pageRenderer } = require('../pageRenderer');

const page = '../templates/utilisation-reports/confirm-delete-payment.njk';
const render = pageRenderer(page);

describe(page, () => {
  const getListRow = (key, value) => ({ key: { text: key }, value: { text: value } });

  const getWrapper = ({ paymentSummaryListRows } = { paymentSummaryListRows: [] }) => render({ paymentSummaryListRows });

  it('renders the page heading', () => {
    const wrapper = getWrapper();

    wrapper.expectText('h1').toRead('Are you sure you want to delete the payment?');
  });

  it('renders a summary list item for each supplied row', () => {
    const paymentSummaryListRows = [
      getListRow('First item', 'First value'),
      getListRow('Second item', 'Second value'),
      getListRow('Third item', 'Third value'),
    ];
    const wrapper = getWrapper({ paymentSummaryListRows });

    const summaryListSelector = 'dl.govuk-summary-list';
    wrapper.expectElement(summaryListSelector).toExist();
    paymentSummaryListRows.forEach(({ key, value }) => {
      wrapper.expectElement(`${summaryListSelector} dt.govuk-summary-list__key:contains("${key.text}")`).toExist();
      wrapper.expectElement(`${summaryListSelector} dd.govuk-summary-list__value:contains("${value.text}")`).toExist();
    });
  });

  it('renders the yes and no radios', () => {
    const wrapper = getWrapper();

    wrapper.expectElement('div.govuk-radios__item').toHaveCount(2);

    const yesRadioLabelSelector = 'label.govuk-radios__label:contains("Yes")';
    wrapper.expectElement(yesRadioLabelSelector).toExist();
    wrapper.expectInput(`div.govuk-radios__item:has(${yesRadioLabelSelector}) input`).toHaveValue('yes');

    const noRadioLabelSelector = 'label.govuk-radios__label:contains("No")';
    wrapper.expectElement(noRadioLabelSelector).toExist();
    wrapper.expectInput(`div.govuk-radios__item:has(${noRadioLabelSelector}) input`).toHaveValue('no');
  });

  it('renders the confirm button', () => {
    const wrapper = getWrapper();

    wrapper.expectPrimaryButton('button.govuk-button').toLinkTo(undefined, 'Continue');
  });
});
