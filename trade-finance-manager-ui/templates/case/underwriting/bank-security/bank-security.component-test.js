const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/bank-security/bank-security.njk';

const render = pageRenderer(page);

describe(page, () => {
  const params = {
    dealId: '1234',
    deal: {
      supportingInformation: {
        security: 'mock security',
      },
    },
  };

  it('should render underwriting heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="underwriting-heading"]').toRead('Underwriting');
  });

  it('should render Bank Security heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="bank-security-heading"]').toRead('Bank Security');
  });

  it('should render the security heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="bank-security-sub-heading"]').toRead(
      'Details of the overarching general security the banks holds for this exporter',
    );
  });

  it('should render the security details', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="bank-security-text"]').toRead(params.deal.supportingInformation.security);
  });
});
