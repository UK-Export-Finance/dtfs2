const componentRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/underwriting/pricing-and-risk/pricing-and-risk.njk';

const render = componentRenderer(page);

describe(page, () => {
  const params = {
    pricingAndRisk: {
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
              type: 'Loan',
            },
          },
          {
            _id: '2',
            facilitySnapshot: {
              ukefFacilityId: '100',
              type: 'Loan',
            },
          },
          {
            _id: '3',
            facilitySnapshot: {
              ukefFacilityId: '100',
              type: 'Loan',
            },
          },
        ],
      },
    },
  };

  it('should render exporter section', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="section-exporter"]').toExist();
  });

  it('should render facilities section', () => {
    const wrapper = render(params);
    wrapper.expectElement('[data-cy="section-facilities"]').toExist();
  });
});
