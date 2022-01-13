const pageRenderer = require('../../../../component-tests/pageRenderer');

const page = '../templates/case/underwriting/pricing-and-risk/pricing-and-risk.njk';

const render = pageRenderer(page);

describe(page, () => {
  const params = {
    dealId: '1234',
    deal: {
      submissionDetails: {
        supplierName: 'The Supplier Name',
      },
      facilities: [
        {
          _id: '1',
          facilitySnapshot: {
            ukefFacilityId: '100',
            facilityType: 'Loan',
          },
        },
        {
          _id: '2',
          facilitySnapshot: {
            ukefFacilityId: '100',
            facilityType: 'Loan',
          },
        },
        {
          _id: '3',
          facilitySnapshot: {
            ukefFacilityId: '100',
            facilityType: 'Loan',
          },
        },
      ],
    },
  };

  it('should render underwriting heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="underwriting-heading"]').toRead('Underwriting');
  });

  it('should render Pricing and risk heading', () => {
    const wrapper = render(params);
    wrapper.expectText('[data-cy="pricing-and-risk-heading"]').toRead('Pricing and risk');
  });

  it('should render exporter section', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="section-exporter"]').toExist();
  });

  it('should render facilities section', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="section-facilities"]').toExist();
  });
});
