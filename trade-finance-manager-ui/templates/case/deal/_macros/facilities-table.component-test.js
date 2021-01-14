const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/deal/_macros/facilities-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    facilities: [
      {
        _id: '123',
        facilityProduct: 'BSS',
        coverEndDate: '02 Nov 2021',
        ukefExposure: 'GBP 1,234.00',
        coveredPercentage: '20%'
      },
      {
        _id: '456',
        facilityProduct: 'EWCS',
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%'
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

    it('should render `product` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-product"]').toRead('Product');
    });

    it('should render `type` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-type"]').toRead('Type');
    });

    it('should render `stage` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-stage"]').toRead('Stage');
    });

    it('should render `tenor` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-tenor"]').toRead('Tenor');
    });

    it('should render `cover end date` table heading', () => {
      wrapper.expectText('[data-cy="facilities-table-heading-cover-end-date"]').toRead('Cover end date');
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
    it('should render facilityProduct table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-product"]`;
        wrapper.expectText(cellSelector).toRead(facility.facilityProduct);
      });
    });

    it('should render coverEndDate table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-cover-end-date"]`;
        wrapper.expectText(cellSelector).toRead(`${facility.coverEndDate} (expected)`);
      });
    });

    it('should render ukefExposure', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-ukef-exposure"]`;
        wrapper.expectText(cellSelector).toRead(`${facility.ukefExposure}`);
      });
    });

    it('should render coveredPercentage', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-covered-percentage"]`;
        wrapper.expectText(cellSelector).toRead(`(${facility.coveredPercentage})`);
      });
    });
  });
});
