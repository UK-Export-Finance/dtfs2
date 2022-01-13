const componentRenderer = require('../../../../component-tests/componentRenderer');

const page = '../templates/case/parties/_macros/parties-bond-beneficiary-area.njk';
const render = componentRenderer(page);

describe(page, () => {
  let wrapper;
  const params = {
    deal: {
      facilities: [],
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  it('should render heading', () => {
    wrapper.expectText('[data-cy="bond-beneficiary-heading"]').toRead('Bond beneficiary');
  });

  it('should render sub heading', () => {
    wrapper.expectText('[data-cy="bond-beneficiary-sub-heading"]').toRead('(if different to buyer)');
  });

  describe('when facilities have bondBeneficiary', () => {
    it('should render bond beneificiary facilities table', () => {
      const paramsWithFacilities = {
        deal: {
          facilities: [
            {
              _id: '123',
              facilitySnapshot: {
                _id: '123',
                ukefFacilityId: '0040004833',
                ukefFacilityType: 'Bond',
                bondBeneficiary: 'test bond beneficiary',
              },
              tfm: {
                bondBeneficiaryPartyUrn: '1234-test',
              },
            },
            {
              _id: '456',
              facilitySnapshot: {
                _id: '456',
                ukefFacilityType: 'Bond',
                ukefFacilityId: '0040004833',
                bondBeneficiary: 'test bond beneficiary',
              },
              tfm: {
                bondBeneficiaryPartyUrn: '1234-test',
              },
            },
            {
              _id: '789',
              facilitySnapshot: {
                _id: '789',
                ukefFacilityType: 'Bond',
                ukefFacilityId: '0040004833',
              },
              tfm: {
                bondBeneficiaryPartyUrn: '1234-test',
              },
            },
          ],
        },
      };

      wrapper = render(paramsWithFacilities);

      wrapper.expectElement('[data-cy="bond-beneficiary-facilities-table"]').toExist();
      wrapper.expectElement('[data-cy="bond-beneficiaries-not-applicable"]').notToExist();
    });
  });

  describe('when facilities do not have bondBeneficiary', () => {
    it('should render `Not applicable`', () => {
      const paramsWithFacilities = {
        deal: {
          facilities: [
            {
              _id: '123',
              facilitySnapshot: {
                _id: '123',
                ukefFacilityType: 'Bond',
              },
            },
            {
              _id: '456',
              facilitySnapshot: {
                _id: '456',
                ukefFacilityType: 'Bond',
              },
            },
            {
              _id: '789',
              facilitySnapshot: {
                _id: '789',
                ukefFacilityType: 'Bond',
              },
            },
          ],
        },
      };

      wrapper = render(paramsWithFacilities);

      wrapper.expectElement('[data-cy="bond-beneficiary-not-applicable"]').toExist();
      wrapper.expectElement('[data-cy="bond-beneficiary-facilities-table"]').notToExist();
    });
  });
});
