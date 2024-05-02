const pageRenderer = require('../pageRenderer');
const { MOCK_TFM_SESSION_USER } = require('../../server/test-mocks/mock-tfm-session-user');
const { PRIMARY_NAVIGATION_KEYS } = require('../../server/constants');

const page = '../templates/utilisation-reports/find-utilisation-reports-by-year.njk';
const render = pageRenderer(page);
const bankItems = [
  { value: '961', text: 'Barclays', attributes: {} },
  { value: '123', text: 'HSBC', attributes: {} },
  { value: '24', text: 'Newable', attributes: {} },
];

describe(page, () => {
  const getWrapper = (bankError, yearError, errorSummary = []) =>
    render({
      user: MOCK_TFM_SESSION_USER,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bankItems,
      errorSummary,
      bankError,
      yearError,
    });

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

  it('should render bank error when present', async () => {
    // Arrange
    const wrapper = await getWrapper('Select a bank');

    // Assert
    wrapper.expectText('main').toContain('Select a bank');
  });

  it('should render year error when present', async () => {
    // Arrange
    const wrapper = await getWrapper(undefined, 'Enter a valid year');

    // Assert
    wrapper.expectText('main').toContain('Enter a valid year');
  });

  it('should render error summary when present', async () => {
    // Arrange
    const wrapper = await getWrapper(undefined, undefined, [
      { text: "You've done something wrong", href: '#id' },
      { text: "You've done another thing wrong", href: '#other' },
    ]);

    // Assert
    wrapper.expectElement('a[href="#id"]').toExist();
    wrapper.expectText('a[href="#id"]').toRead("You've done something wrong");
    wrapper.expectElement('a[href="#other"]').toExist();
    wrapper.expectText('a[href="#other"]').toRead("You've done another thing wrong");
  });
});
