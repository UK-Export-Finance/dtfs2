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
        .toHaveAttribute('integrity', 'sha512-s1t9S69wIVNKrVuQiOyFTa5xhpf0I9T78GVjdfaje2HLgmr6UtyhyBmTGao210xj8vzXQkd2a7UnrWPutB+D4w==');
    });

    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/ukefexposure.js"]')
        .toHaveAttribute('integrity', 'sha512-JqO2JNiUWvxgigIPcuwRXTp885MEQS1xSI/mTJnyphzzP7Xw1/z1Lggax/RqlLCeKphmQXzwZ2/ldc+Lf6LOrA==');
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
        .toHaveAttribute('integrity', 'sha512-s1t9S69wIVNKrVuQiOyFTa5xhpf0I9T78GVjdfaje2HLgmr6UtyhyBmTGao210xj8vzXQkd2a7UnrWPutB+D4w==');
    });

    it('should have the correct integrity value', () => {
      wrapper
        .expectElement('script[src="/assets/js/ukefexposure.js"]')
        .toHaveAttribute('integrity', 'sha512-JqO2JNiUWvxgigIPcuwRXTp885MEQS1xSI/mTJnyphzzP7Xw1/z1Lggax/RqlLCeKphmQXzwZ2/ldc+Lf6LOrA==');
    });
  });
});
