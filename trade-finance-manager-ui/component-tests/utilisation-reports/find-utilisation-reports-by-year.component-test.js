const pageRenderer = require('../pageRenderer');
const { MOCK_TFM_SESSION_USER } = require('../../server/test-mocks/mock-tfm-session-user');

const page = '../templates/utilisation-reports/find-utilisation-reports-by-year.njk';
const render = pageRenderer(page);
const bankItems = [
  { value: '961', text: 'Barclays', attributes: {} },
  { value: '123', text: 'HSBC', attributes: {} },
  { value: '24', text: 'Newable', attributes: {} },
];

describe(page, () => {
  const getWrapper = () => {
    const params = {
      user: MOCK_TFM_SESSION_USER,
      bankItems,
      validationErrors: [],
    };
    return render(params);
  };

  it('should render the main heading', async () => {
    // Arrange
    const wrapper = await getWrapper();

    // Assert
    wrapper.expectText('h1[data-cy="find-reports-by-year-heading"]').toRead('Find reports by year');
  });

  it(`should render a radio button for each bank`, async () => {
    // Arrange
    const wrapper = await getWrapper();

    // Assert
    wrapper.expectElement(`input[type="radio"][value="${bankItems[0].value}"]`).toExist();
    wrapper.expectElement(`input[type="radio"][value="${bankItems[1].value}"]`).toExist();
    wrapper.expectElement(`input[type="radio"][value="${bankItems[2].value}"]`).toExist();
    wrapper.expectText(`input[type="radio"][value="${bankItems[0].value}"] ~ label`).toRead(bankItems[0].text);
    wrapper.expectText(`input[type="radio"][value="${bankItems[1].value}"] ~ label`).toRead(bankItems[1].text);
    wrapper.expectText(`input[type="radio"][value="${bankItems[2].value}"] ~ label`).toRead(bankItems[2].text);
  });

  it('should render the year label', async () => {
    // Arrange
    const wrapper = await getWrapper();

    // Assert
    wrapper.expectText('label[data-cy="year-label"]').toRead('Year');
  });

  it('should render the continue button', async () => {
    // Arrange
    const wrapper = await getWrapper();

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });
});
