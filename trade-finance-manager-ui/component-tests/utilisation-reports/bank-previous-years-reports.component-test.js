const pageRenderer = require('../pageRenderer');
const { MOCK_TFM_SESSION_USER } = require('../../server/test-mocks/mock-tfm-session-user');

const page = '../templates/utilisation-reports/bank-previous-years-reports.njk';
const render = pageRenderer(page);

describe(page, () => {
  const getWrapper = () => {
    const params = {
      user: MOCK_TFM_SESSION_USER,
    };
    return render(params);
  };

  it('should render the main heading', () => {
    getWrapper().expectText('[data-cy="bank-previous-years-reports-heading"]').toRead("Previous years' reports");
  });
});
