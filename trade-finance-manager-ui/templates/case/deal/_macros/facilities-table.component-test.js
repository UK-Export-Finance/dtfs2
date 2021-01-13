const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/deal/_macros/facilities-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    facilities: [
      {
        _id: '123',
        facilityType: 'BSS',
        expectedExpiryDate: '02 Nov 2021',
      },
      {
        _id: '456',
        facilityType: 'EWCS',
        expectedExpiryDate: '04 Dec 2021',
      },
    ]
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headings', () => {
    it('should render `facility id` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-facility-id"]').toRead('Facility ID');
    });

    it('should render `type` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-type"]').toRead('Type');
    });

    it('should render `status` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-status"]').toRead('Status');
    });

    it('should render `issue date` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-issue-date"]').toRead('Expected issue date');
    });

    it('should render `tenor` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-tenor"]').toRead('Tenor');
    });

    it('should render `expected expiry date` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-expected-expiry-date"]').toRead('Expected expiry date');
    });

    it('should render `value (export currency)` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-value-export-currency"]').toRead('Value (export currency)');
    });

    it('should render `value (GBP)` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-value-gbp"]').toRead('Value (GBP)');
    });

    it('should render `UKEF exposure` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-ukef-exposure"]').toRead('UKEF exposure');
    });
  });

  
  describe('for each facility', () => {
    it('should render facilityType table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-type"]`;
        wrapper.expectText(cellSelector).toRead(facility.facilityType);
      });
    });

    it('should render expectedExpiryDate table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-expected-expiry-date"]`;
        wrapper.expectText(cellSelector).toRead(facility.expectedExpiryDate);
      });
    });

  });
});
