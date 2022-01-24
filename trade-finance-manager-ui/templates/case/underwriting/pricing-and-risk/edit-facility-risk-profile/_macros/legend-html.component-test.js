const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/edit-facility-risk-profile/_macros/legend-html.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '1234',
    facilityId: '100',
    ukefFacilityId: '100200',
    type: 'Performance bond',
  };

  it('should render link with ukefFacilityId', () => {
    wrapper = render(params);

    const selector = '[data-cy="edit-facility-risk-profile-legend-link"]';

    wrapper.expectLink(selector).toLinkTo(
      `/case/${params.caseId}/facility/${params.facilityId}`,
      params.ukefFacilityId,
    );
  });

  it('should render text with type', () => {
    wrapper = render(params);

    const selector = '[data-cy="edit-facility-risk-profile-legend-facility-type"]';

    wrapper.expectText(selector).toRead(params.type);
  });
});
