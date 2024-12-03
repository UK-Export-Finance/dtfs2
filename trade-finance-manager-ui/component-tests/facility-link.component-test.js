const { componentRenderer } = require('./componentRenderer');

const component = '../templates/_macros/facility-link.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '100123',
    facilityId: '123',
    ukefFacilityId: '0040004833',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render ukefFacilityId link, linking to facility id', () => {
    const selector = `[data-cy="facility-${params.facilityId}-ukef-facility-id-link"]`;

    wrapper.expectLink(selector).toLinkTo(`/case/${params.caseId}/facility/${params.facilityId}`, `View facility ${params.ukefFacilityId} details`);
  });
});
