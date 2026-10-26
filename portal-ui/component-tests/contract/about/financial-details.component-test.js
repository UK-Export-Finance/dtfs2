const pageRenderer = require('../../pageRenderer');
const deal = require('../../fixtures/deal-fully-completed');

const loan = 'loan/loan-financial-details.njk';
let render = pageRenderer(loan);

describe(loan, () => {
  let wrapper;
  const { submissionDetails } = deal;

  beforeEach(() => {
    wrapper = render(submissionDetails);
  });

  describe('Script SRI', () => {
    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/guaranteeFeePayableByBank.js"]')
        .toHaveAttribute('integrity', 'sha512-NL+2iGMneoDNeM+shd5vt2jSBnjirT7vqqgyaKd74LX83pWQWmeWkIfov/FtNnKcg0XE8JrFziMGIExHFTODPg==');
    });

    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/ukefexposure.js"]')
        .toHaveAttribute('integrity', 'sha512-CXH1KfMUnEYhDXwnOUsMO4hca370xchjprcr/Funuwj802QCC0rdY6Af2gnAQr8U/+Nl32YKyBKwQssOeNkbbQ==');
    });
  });
});

const bond = 'bond/bond-financial-details.njk';
render = pageRenderer(bond);

describe(bond, () => {
  let wrapper;
  const { submissionDetails } = deal;

  beforeEach(() => {
    wrapper = render(submissionDetails);
  });

  describe('Script SRI', () => {
    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/guaranteeFeePayableByBank.js"]')
        .toHaveAttribute('integrity', 'sha512-NL+2iGMneoDNeM+shd5vt2jSBnjirT7vqqgyaKd74LX83pWQWmeWkIfov/FtNnKcg0XE8JrFziMGIExHFTODPg==');
    });

    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/ukefexposure.js"]')
        .toHaveAttribute('integrity', 'sha512-CXH1KfMUnEYhDXwnOUsMO4hca370xchjprcr/Funuwj802QCC0rdY6Af2gnAQr8U/+Nl32YKyBKwQssOeNkbbQ==');
    });
  });
});
