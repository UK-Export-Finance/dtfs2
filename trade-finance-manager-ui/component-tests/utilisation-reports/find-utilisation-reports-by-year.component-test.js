const pageRenderer = require('../pageRenderer');
const { MOCK_BANKS } = require('../../server/test-mocks/mock-banks');
const { MOCK_TFM_SESSION_USER } = require('../../server/test-mocks/mock-tfm-session-user');

const page = '../templates/utilisation-reports/find-utilisation-reports-by-year.njk';
const render = pageRenderer(page);
const banks = [MOCK_BANKS.BARCLAYS, MOCK_BANKS.HSBC, MOCK_BANKS.NEWABLE];

describe(page, () => {
  const getWrapper = () => {
    const params = {
      user: MOCK_TFM_SESSION_USER,
      banks,
      validationErrors: [],
    };
    return render(params);
  };

  it('should render the main heading', async () => {
    (await getWrapper()).expectElement('[data-cy="find-reports-by-year-heading"]').toExist();
  });

  banks.forEach(bank => {
    it(`should render the ${bank.name} radio button`, async () => {
      (await getWrapper()).expectElement(`[data-cy="${bank.name}-radio-input"]`).toExist();
      (await getWrapper()).expectText(`[data-cy="${bank.name}-radio-label"]`).toRead(bank.name);
    });
  });

  it('should render the year label', async () => {
    (await getWrapper()).expectElement('[data-cy="year-label"]').toExist();
  });

  it('should render the continue button', async () => {
    (await getWrapper()).expectElement('[data-cy="continue-button"]').toExist();
  });
});
