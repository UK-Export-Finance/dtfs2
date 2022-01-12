const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/parties/_macros/bond-issuer-facilities-table.njk';

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
          bondIssuer: 'test bond issuer',
        },
        tfm: {
          bondIssuerPartyUrn: '1234-test',
        },
      },
      {
        _id: '456',
        facilitySnapshot: {
          _id: '456',
          ukefFacilityType: 'Bond',
          ukefFacilityId: '0040004833',
          bondIssuer: 'test bond issuer',
          bankFacilityReference: '1234-test',
        },
        tfm: {
          bondIssuerPartyUrn: '1234-test',
        },
      },
      {
        _id: '789',
        facilitySnapshot: {
          _id: '789',
          ukefFacilityType: 'Bond',
          ukefFacilityId: '0040004833',
          bankFacilityReference: '1234-test',
        },
        tfm: {
          bondIssuerPartyUrn: '1234-test',
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

    it('should render `bond issuer` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-bond-issuer"]').toRead('Bond issuer');
    });

    it('should render `unique reference number` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-unique-reference-number"]').toRead('Unique Reference Number');
    });
  });

  it('should render ukefFacilityId link, linking to facility id', () => {
    const expectedFacilities = params.facilities.filter(({ facilitySnapshot: f }) =>
      f.ukefFacilityType === 'Bond'
    && f.bondIssuer);

    expectedFacilities.forEach(({ facilitySnapshot: facility }) => {
      const selector = `[data-cy="facility-${facility._id}-ukef-facility-id-link"]`;

      wrapper.expectLink(selector).toLinkTo(
        `/case/${params.caseId}/facility/${facility._id}`,
        facility.ukefFacilityId,
      );
    });
  });

  describe('unique reference number (bondIssuerPartyUrn) table cell value', () => {
    it('should render', () => {
      const expectedFacilities = params.facilities.filter(({ facilitySnapshot: f, tfm }) =>
        f.bondIssuer
        && tfm.bondIssuerPartyUrn);

      expectedFacilities.forEach((facility) => {
        const selector = `[data-cy="facility-${facility._id}-unique-reference-number"]`;
        wrapper.expectText(selector).toRead(facility.tfm.bondIssuerPartyUrn);
        wrapper.expectElement(`[data-cy="facility-${facility._id}-unique-reference-number-not-matched"]`).notToExist();
      });
    });

    it('should render `not matched` tag when there is no bondIssuerPartyUrn value', () => {
      const expectedFacilities = params.facilities.filter(({ facilitySnapshot: f, tfm }) =>
        f.bondIssuer
        && !tfm.bondIssuerPartyUrn);

      expectedFacilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-unique-reference-number-not-matched"]`;
        wrapper.expectText(cellSelector).toRead(facility.tfm.bondIssuerPartyUrn);
      });
    });
  });
});
