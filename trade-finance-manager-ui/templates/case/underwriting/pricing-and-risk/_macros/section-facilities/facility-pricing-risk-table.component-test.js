const componentRenderer = require('../../../../../../component-tests/componentRenderer');
const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-facilities/facility-pricing-risk-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '1234',
    facility: {
      _id: '1',
      facilitySnapshot: {
        ukefFacilityID: '100',
        facilityType: 'loan',
      },
      tfm: {
        riskProfile: 'Flat',
      },
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render link to facility page', () => {
    wrapper.expectLink(`[data-cy="facility-${params.facility._id}-ukef-facility-id-link"]`).toLinkTo(
      `/case/${params.caseId}/facility/${params.facility._id}`,
      params.facility.facilitySnapshot.ukefFacilityID
    );
  });

  it('should render facility type', () => {
    wrapper.expectText(`[data-cy="facility-${params.facility._id}-type"]`).toRead(params.facility.facilitySnapshot.facilityType);
  });

  describe('risk profile table row', () => {
    it('should render heading', () => {
      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-heading"]`).toRead('Risk profile');
    });

    it('should render value', () => {
      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-value"]`).toRead(params.facility.tfm.riskProfile);
    }); 
  });

});
