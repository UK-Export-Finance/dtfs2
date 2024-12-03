const { componentRenderer } = require('../../../../../../componentRenderer');

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
        type: 'Loan',
      },
    },
  };

  it('should render link to facility page', () => {
    wrapper = render(params);

    wrapper
      .expectLink(`[data-cy="facility-${params.facility._id}-ukef-facility-id-link"]`)
      .toLinkTo(`/case/${params.caseId}/facility/${params.facility._id}`, `View facility ${params.facility.facilitySnapshot.ukefFacilityId} details`);
  });

  it('should render facility type', () => {
    wrapper = render(params);

    wrapper.expectText(`[data-cy="facility-${params.facility._id}-type"]`).toRead(params.facility.facilitySnapshot.type);
  });

  describe('guarantee fee payable to UKEF table row', () => {
    it('should render heading', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy=facility-${params.facility._id}-bank-guarantee-fee-heading]`).toRead('Guarantee fee % payable to UKEF');
    });

    it('should render value if defined', () => {
      const paramsWithGuaranteeFee = {
        ...params,
        facility: {
          ...params.facility,
          facilitySnapshot: {
            ...params.facility.facilitySnapshot,
            guaranteeFeePayableToUkef: '7.0200%',
          },
        },
      };
      wrapper = render(paramsWithGuaranteeFee);

      wrapper
        .expectText(`[data-cy="facility-${params.facility._id}-bank-guarantee-fee-value"]`)
        .toRead(paramsWithGuaranteeFee.facility.facilitySnapshot.guaranteeFeePayableToUkef);
    });

    it('should render - for the value if undefined', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-bank-guarantee-fee-value"]`).toRead('-');
    });
  });

  describe('banks interest margin table row', () => {
    it('should render heading', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy=facility-${params.facility._id}-bank-interest-heading]`).toRead("Bank's interest margin");
    });

    it('should render value if defined', () => {
      const paramsWithInterestMargin = {
        ...params,
        facility: {
          ...params.facility,
          facilitySnapshot: {
            ...params.facility.facilitySnapshot,
            banksInterestMargin: '7.8%',
          },
        },
      };
      wrapper = render(paramsWithInterestMargin);

      wrapper
        .expectText(`[data-cy="facility-${params.facility._id}-bank-interest-value"]`)
        .toRead(paramsWithInterestMargin.facility.facilitySnapshot.banksInterestMargin);
    });

    it('should render - for the value if undefined', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-bank-interest-value"]`).toRead('-');
    });
  });

  describe('risk profile table row', () => {
    it('should render heading', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-heading"]`).toRead('Risk profile');
    });

    it('should render - for the value if undefined', () => {
      wrapper = render(params);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-value"]`).toRead('-');
    });

    it('should render value if defined', () => {
      const paramsWithRiskProfile = {
        ...params,
        facility: {
          ...params.facility,
          tfm: {
            riskProfile: 'Flat',
          },
        },
      };
      wrapper = render(paramsWithRiskProfile);

      wrapper.expectText(`[data-cy="facility-${params.facility._id}-risk-profile-value"]`).toRead(paramsWithRiskProfile.facility.tfm.riskProfile);
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

        wrapper.expectLink(`[data-cy="facility-${params.facility._id}-change-risk-profile-link"]`).toLinkTo(expectedLink, 'Change risk profile');
      });
    });
  });
});
