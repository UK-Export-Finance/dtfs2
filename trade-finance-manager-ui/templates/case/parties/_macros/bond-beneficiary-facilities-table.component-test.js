const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/parties/_macros/bond-beneficiary-facilities-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    caseId: '100123',
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
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headings', () => {
    it('should render `facility id` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-facility-id"]').toRead('Facility ID');
    });

    it('should render `bond beneficiary` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-bond-beneficiary"]').toRead('Bond beneficiary');
    });

    it('should render `unique reference number` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-unique-reference-number"]').toRead('Unique Reference Number');
    });
  });

  it('should render ukefFacilityId link, linking to facility id', () => {
    const expectedFacilities = params.facilities.filter(({ facilitySnapshot: f, tfm }) =>
      f.ukefFacilityType === 'Bond'
      && tfm.bondBeneficiaryPartyUrn);

    expectedFacilities.forEach(({ facilitySnapshot }) => {
      const selector = `[data-cy="facility-${facilitySnapshot._id}-ukef-facility-id-link"]`;

      wrapper.expectLink(selector).toLinkTo(
        `/case/${params.caseId}/facility/${facilitySnapshot._id}`,
        facilitySnapshot.ukefFacilityId,
      );
    });
  });

  describe('unique reference number (bankFacilityReference) table cell value', () => {
    it('should render', () => {
      const expectedFacilities = params.facilities.filter(({ facilitySnapshot: f, tfm }) =>
        f.bondBeneficiary
        && tfm.bondBeneficiaryPartyUrn);

      expectedFacilities.forEach((facility) => {
        const selector = `[data-cy="facility-${facility._id}-unique-reference-number"]`;
        wrapper.expectText(selector).toRead(facility.tfm.bondBeneficiaryPartyUrn);
        wrapper.expectElement(`[data-cy="facility-${facility._id}-unique-reference-number-not-matched"]`).notToExist();
      });
    });

    it('should render `not matched` tag when there is no bankFacilityReference value', () => {
      const expectedFacilities = params.facilities.filter(({ facilitySnapshot: f, tfm }) =>
        f.bondBeneficiary
        && !tfm.bondBeneficiaryPartyUrn);

      expectedFacilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-unique-reference-number-not-matched"]`;
        wrapper.expectText(cellSelector).toRead(facility.tfm.bondBeneficiaryPartyUrn);
      });
    });
  });
});
