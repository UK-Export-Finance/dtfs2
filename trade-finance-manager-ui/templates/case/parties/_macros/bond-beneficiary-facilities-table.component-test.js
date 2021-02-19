const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/parties/_macros/bond-beneficiary-facilities-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    facilities: [
      {
        _id: '123',
        ukefFacilityID: '0040004833',
        ukefFacilityType: 'bond',
        bondBeneficiary: 'test bond beneficiary',
        bankFacilityReference: '1234-test',
      },
      {
        _id: '456',
        ukefFacilityType: 'bond',
        ukefFacilityID: '0040004833',
        bondBeneficiary: 'test bond beneficiary',
        bankFacilityReference: '1234-test',
      },
      {
        _id: '789',
        ukefFacilityType: 'bond',
        ukefFacilityID: '0040004833',
        bankFacilityReference: '1234-test',
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

  const expectedFacilities = params.facilities.filter((f) =>
      f.ukefFacilityType === 'bond'
      && f.bondBeneficiary);

  it('should render ukefFacilityID link, linking to facility id', () => {
    expectedFacilities.forEach((facility) => {
      const selector = `[data-cy="facility-${facility._id}-ukef-facility-id-link"]`;

      wrapper.expectLink(selector).toLinkTo(
        `/case/facility/${facility._id}`,
        facility.ukefFacilityID);

    });
  });

  describe('unique reference number (bankFacilityReference) table cell value', () => {
    it('should render', () => {
      const expectedFacilities = params.facilities.filter((f) =>
        f.bondBeneficiary
        && f.bankFacilityReference);

      expectedFacilities.forEach((facility) => {
        const selector = `[data-cy="facility-${facility._id}-unique-reference-number"]`;
        wrapper.expectText(selector).toRead(facility.bankFacilityReference);
        wrapper.expectElement(`[data-cy="facility-${facility._id}-unique-reference-number-not-matched"]`).notToExist();
      });
    });

    it('should render `not matched` tag when there is no bankFacilityReference value', () => {
      const expectedFacilities = params.facilities.filter((f) =>
        f.bondBeneficiary
        && !f.bankFacilityReference);

      expectedFacilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-unique-reference-number-not-matched"]`;
        wrapper.expectText(cellSelector).toRead(facility.bankFacilityReference);
      });
    });
  });
});
