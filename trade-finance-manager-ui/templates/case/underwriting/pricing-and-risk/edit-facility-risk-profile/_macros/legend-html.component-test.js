const componentRenderer = require('../../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/pricing-and-risk/edit-facility-risk-profile/_macros/legend-html.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    caseId: '1234',
    facilityId: '100',
    ukefFacilityID: '100200',
    facilityType: 'Performance bond',
  };

  it('should render link with ukefFacilityID', () => {
    wrapper = render(params);

    const selector = '[data-cy="edit-facility-risk-profile-legend-link"]';

    wrapper.expectLink(selector).toLinkTo(
      `/case/${params.caseId}/facility/${params.facilityId}`,
      params.ukefFacilityID,
    )
  });

  it('should render text with facilityType', () => {
    wrapper = render(params);

    const selector = '[data-cy="edit-facility-risk-profile-legend-facility-type"]';

    wrapper.expectText(selector).toRead(params.facilityType);
  });
});
