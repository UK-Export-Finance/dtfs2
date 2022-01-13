const componentRenderer = require('../../../../../../component-tests/componentRenderer');

const component = '../templates/case/underwriting/pricing-and-risk/_macros/section-facilities/facility-pricing-risk-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  let params = {
    caseId: '1234',
    facility: {
      _id: '1',
      facilitySnapshot: {
        ukefFacilityId: '100',
        facilityType: 'Loan',
      },
      tfm: {
        riskProfile: 'Flat',
      },
    },
  };

  it('should render link to facility page', () => {
    wrapper = render(params);

    wrapper.expectLink(`[data-cy="facility-${params.facility._id}-ukef-facility-id-link"]`).toLinkTo(
      `/case/${params.caseId}/facility/${params.facility._id}`,
      params.facility.facilitySnapshot.ukefFacilityId,
    );
  });

  it('should render facility type', () => {
    wrapper = render(params);

    wrapper.expectText(`[data-cy="facility-${params.facility._id}-type"]`).toRead(params.facility.facilitySnapshot.facilityType);
  });

  describe('risk profile table row', () => {
    it('should render heading', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-heading"]`).toRead('Risk profile');
    });

    it('should render value', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-value"]`).toRead(params.facility.tfm.riskProfile);
    });

    it('should NOT render change link', () => {
      wrapper = render(params);

      wrapper.expectElement(`[data-cy="facility-${params.facility._id}-change-risk-profile-link"]`).notToExist();
    });

    describe('with params.userCanEdit', () => {
      it('should render change link', () => {
        params = {
          ...params,
          userCanEdit: true,
        };

        wrapper = render(params);

        const expectedLink = `/case/${params.caseId}/underwriting/pricing-and-risk/facility/${params.facility._id}/risk-profile`;

        wrapper.expectLink(`[data-cy="facility-${params.facility._id}-change-risk-profile-link"]`)
          .toLinkTo(expectedLink, 'Change');
      });
    });
  });
});
