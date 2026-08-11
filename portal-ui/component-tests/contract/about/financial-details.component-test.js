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
        .toHaveAttribute('integrity', 'sha512-sMu28F6ka0dXHmVC91uY5Ky4jr2GXjvHqmwc6EjfNZq46+MlZxdKVhbdcnX580rlrIGIsGSTYuxKgSN9epklFA==');
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
        .toHaveAttribute('integrity', 'sha512-sMu28F6ka0dXHmVC91uY5Ky4jr2GXjvHqmwc6EjfNZq46+MlZxdKVhbdcnX580rlrIGIsGSTYuxKgSN9epklFA==');
    });
  });
});
