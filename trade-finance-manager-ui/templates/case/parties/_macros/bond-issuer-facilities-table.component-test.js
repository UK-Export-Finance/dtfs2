const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/parties/_macros/bond-issuer-facilities-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    facilities: [
      {
        _id: '123',
        ukefFacilityID: '0040004833',
        ukefFacilityType: 'bond',
        bondIssuer: 'test bond issuer',
      },
      {
        _id: '456',
        ukefFacilityType: 'bond',
        ukefFacilityID: '0040004833',
        bondIssuer: 'test bond issuer',
      },
      {
        _id: '789',
        ukefFacilityType: 'bond',
        ukefFacilityID: '0040004833',
      },
      {
        _id: '112',
        ukefFacilityType: 'loan',
        ukefFacilityID: '0040004833',
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

  describe('for each bond facility with bondIssuer value', () => {
    const expectedFacilities = params.facilities.filter((f) =>
      f.ukefFacilityType === 'bond'
      && f.bondIssuer);

    it('should render ukefFacilityID link, linking to facility id', () => {
      expectedFacilities.forEach((facility) => {
        const selector = `[data-cy="facility-${facility._id}-ukef-facility-id-link"]`;

        wrapper.expectLink(selector).toLinkTo(
          `/case/facility/${facility._id}`,
          facility.ukefFacilityID);

      });
    });

    // it('should render TODO table cell value', () => {
    //   expectedFacilities.forEach((facility) => {
    //     const cellSelector = `[data-cy="facility-${facility._id}-unique-reference-number"]`;
    //     wrapper.expectText(cellSelector).toRead(facility.facilityProduct.code);
    //   });
    // });

    it('should not render facilties that are not a bond or do not have bondIssuer value', () => {
      const faciliitesThatShouldNotBeRendered = params.facilities.filter((f) =>
        f.ukefFacilityType !== 'bond'
        || !f.bondIssuer);

      return faciliitesThatShouldNotBeRendered.forEach((facility) =>
        wrapper.expectElement(`[data-cy="facility-${facility._id}"]`).notToExist());
    });

  });
});
