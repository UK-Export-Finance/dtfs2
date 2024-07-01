const { pageRenderer } = require('../pageRenderer');
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
  const getWrapper = ({ bankError, yearError, errorSummary } = {}) =>
    render({
      user: MOCK_TFM_SESSION_USER,
      activePrimaryNavigation: PRIMARY_NAVIGATION_KEYS.UTILISATION_REPORTS,
      bankItems,
      errorSummary: errorSummary ?? [],
      bankError,
      yearError,
    });

  it('should render the main heading', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectText('h1[data-cy="find-reports-by-year-heading"]').toRead('Find reports by year');
  });

  it(`should render a radio button for each bank`, () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    bankItems.forEach((bankItem) => {
      const radioSelector = `input[type="radio"][value="${bankItem.value}"]`;
      wrapper.expectElement(radioSelector).toExist();
      wrapper.expectText(`${radioSelector} ~ label`).toRead(bankItem.text);
    });
  });

  it('should render the year label', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectText('label[data-cy="year-label"]').toRead('Year');
  });

  it('should render the continue button', () => {
    // Arrange
    const wrapper = getWrapper();

    // Assert
    wrapper.expectElement('[data-cy="continue-button"]').toExist();
    wrapper.expectText('[data-cy="continue-button"]').toRead('Continue');
  });

  it('should render bank error when present', () => {
    // Arrange
    const wrapper = getWrapper({ bankError: 'Select a bank' });

    // Assert
    wrapper.expectText('main').toContain('Select a bank');
  });

  it('should render year error when present', () => {
    // Arrange
    const wrapper = getWrapper({ yearError: 'Enter a valid year' });

    // Assert
    wrapper.expectText('main').toContain('Enter a valid year');
  });

  it('should render error summary when present', () => {
    // Arrange
    const wrapper = getWrapper({
      errorSummary: [
        { text: "You've done something wrong", href: '#id' },
        { text: "You've done another thing wrong", href: '#other' },
      ],
    });

    // Assert
    wrapper.expectElement('a[href="#id"]').toExist();
    wrapper.expectText('a[href="#id"]').toRead("You've done something wrong");
    wrapper.expectElement('a[href="#other"]').toExist();
    wrapper.expectText('a[href="#other"]').toRead("You've done another thing wrong");
  });
});
