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
        coveredPercentage: '20%',
        facilityType: 'Performance Bond',
        facilityValue: 'GBP 1,234',
        facilityValueExportCurrency: 'AUD 34000',
        facilityStage: 'Commitment',
      },
      {
        _id: '456',
        facilityProduct: 'EWCS',
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%',
        facilityValue: 'GBP 1,234',
        facilityValueExportCurrency: 'AUD 34000',
        facilityStage: 'Issued',
      },
      {
        _id: '789',
        facilityProduct: 'EWCS',
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%',
        facilityValue: '',
        facilityValueExportCurrency: 'AUD 34000',
        facilityStage: 'Commitment',
      },
      {
        _id: '112',
        facilityProduct: '',
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%',
        facilityValue: 'GBP 1,234',
        facilityValueExportCurrency: 'AUD 34000',
        facilityStage: 'Issued',
      },
    ],
    totals: {
      facilitiesValue: 'GBP 123,456.78',
    }
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
    describe('facilityProduct table cell', () => {
      it('should render value', () => {
        const facilities = params.facilities.filter((f) => f.facilityProduct !== '');

        facilities.forEach((facility) => {
          const cellSelector = `[data-cy="facility-${facility._id}-product"]`;
          wrapper.expectText(cellSelector).toRead(facility.facilityProduct);
        });
      });

      it('should render a dash when facilityProduct is empty', () => {
        const facility = params.facilities.find((f) => f.facilityProduct === '');

        const cellSelector = `[data-cy="facility-${facility._id}-type"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    describe('facilityType table cell', () => {
      it('should render facilityType when facility is bond', () => {
        const bond = params.facilities.find((f) => f.facilityProduct === 'BSS');

        const cellSelector = `[data-cy="facility-${bond._id}-type"]`;
        wrapper.expectText(cellSelector).toRead(bond.facilityType);
      });

      it('should render a dash when facility is loan', () => {
        const facility = params.facilities.find((f) => f.facilityProduct !== 'BSS');

        const cellSelector = `[data-cy="facility-${facility._id}-type"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    it('should render facilityStage table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-stage"]`;
        wrapper.expectText(cellSelector).toRead(facility.facilityStage);
      });
    });

    it('should render coverEndDate table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-cover-end-date"]`;
        wrapper.expectText(cellSelector).toRead(`${facility.coverEndDate} (expected)`);
      });
    });

    it('should render `value (export currency)` table cell', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-value-export-currency"]`;
        wrapper.expectText(cellSelector).toRead(facility.facilityValueExportCurrency);
      });
    });

    describe('`facilityValue in GBP` table cell', () => {
      it('should render', () => {
        const facilities = params.facilities.filter((f) => f.facilityValue !== '');

        facilities.forEach((facility) => {
          const cellSelector = `[data-cy="facility-${facility._id}-value-gbp"]`;
          wrapper.expectText(cellSelector).toRead(facility.facilityValue);
        });
      });

      it('should render a dash when facilityValue is empty', () => {
        const facility = params.facilities.find((f) => f.facilityValue === '');

        const cellSelector = `[data-cy="facility-${facility._id}-value-gbp"]`;
        wrapper.expectText(cellSelector).toRead('-');
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

  describe('totals row', () => {
    it('should render totals.facilitiesValue', () => {
      const cellSelector = '[data-cy="facilities-total-value"]';
      wrapper.expectText(cellSelector).toRead(params.totals.facilitiesValue);
    });
  });
});
