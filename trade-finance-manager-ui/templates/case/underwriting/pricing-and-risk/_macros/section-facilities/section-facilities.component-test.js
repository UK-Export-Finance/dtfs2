const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-facilities/section-facilities.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '1234',
    facilities: [
      {
        _id: '1',
        facilitySnapshot: {
          ukefFacilityId: '100',
          facilityType: 'loan',
        },
      },
      {
        _id: '2',
        facilitySnapshot: {
          ukefFacilityId: '100',
          facilityType: 'loan',
        },
      },
      {
        _id: '3',
        facilitySnapshot: {
          ukefFacilityId: '100',
          facilityType: 'loan',
        },
      },
    ],
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render Facilities heading', () => {
    wrapper = render(params);
    wrapper.expectText('[data-cy="facilities-heading"]').toRead('Facilities');
  });

  it('should render facility-pricing-risk-table for each facility', () => {
    wrapper = render(params);

    params.facilities.forEach((facility) => {
      wrapper.expectElement(`[data-cy="facility-${facility._id}-pricing-risk-table"]`).toExist();
    });
  });
});
