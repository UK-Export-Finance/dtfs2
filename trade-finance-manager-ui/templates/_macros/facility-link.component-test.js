const componentRenderer = require('../../component-tests/componentRenderer');

const component = '../templates/_macros/facility-link.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    id: '123',
    ukefFacilityID: '0040004833', 
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render ukefFacilityID link, linking to facility id', () => {
    const selector = `[data-cy="facility-${params.id}-ukef-facility-id-link"]`;

    wrapper.expectLink(selector).toLinkTo(
      `/case/facility/${params.id}`,
      params.ukefFacilityID);
  });
});
