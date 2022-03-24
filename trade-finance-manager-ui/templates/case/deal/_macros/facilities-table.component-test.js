const componentRenderer = require('../../../../component-tests/componentRenderer');

const component = '../templates/case/deal/_macros/facilities-table.njk';

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
          facilityProduct: {
            code: 'BSS',
          },
          ukefExposure: 'GBP 1,234.00',
          coveredPercentage: '20%',
          type: 'Performance Bond',
          value: 'GBP 1,234',
          facilityValueExportCurrency: 'AUD 34000',
          facilityStage: 'Commitment',
          hasBeenIssued: true,
          dates: {
            coverEndDate: '02 Nov 2021',
            tenor: '1 month',
          },
        },
        tfm: {
          ukefExposure: {
            exposure: 'GBP 123,456.78',
          },
        },
      },
      {
        _id: '456',
        facilitySnapshot: {
          _id: '456',
          ukefFacilityId: '0040004833',
          facilityProduct: {
            code: 'EWCS',
          },
          ukefExposure: 'GBP 2,469.00',
          coveredPercentage: '20%',
          value: 'GBP 1,234',
          facilityValueExportCurrency: 'AUD 34000',
          facilityStage: 'Issued',
          hasBeenIssued: true,
          dates: {
            coverEndDate: '04 Dec 2021',
            tenor: '1 month',
          },
        },
        tfm: {
          ukefExposure: {
            exposure: 'GBP 123,456.78',
          },
        },
      },
      {
        _id: '789',
        facilitySnapshot: {
          _id: '789',
          ukefFacilityId: '0040004833',
          facilityProduct: {
            code: 'EWCS',
          },
          ukefExposure: 'GBP 2,469.00',
          coveredPercentage: '20%',
          value: '',
          facilityValueExportCurrency: 'AUD 34000',
          facilityStage: 'Commitment',
          hasBeenIssued: true,
          dates: {
            coverEndDate: '04 Dec 2021',
            tenor: '1 month',
          },
        },
        tfm: {
          ukefExposure: {
            exposure: 'GBP 123,456.78',
          },
        },
      },
      {
        _id: '112',
        facilitySnapshot: {
          _id: '112',
          ukefFacilityId: '0040004833',
          facilityProduct: {
            code: '',
          },
          ukefExposure: 'GBP 2,469.00',
          coveredPercentage: '20%',
          value: 'GBP 1,234',
          facilityValueExportCurrency: 'AUD 34000',
          facilityStage: 'Issued',
          hasBeenIssued: true,
          dates: {
            coverEndDate: '04 Dec 2021',
            tenor: '1 month',
          },
        },
        tfm: {
          ukefExposure: {
            exposure: 'GBP 123,456.78',
          },
        },
      },
    ],
    totals: {
      facilitiesValueInGBP: 'GBP 123,456.78',
      facilitiesUkefExposure: 'GBP 10,200.12',
    },
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
    it('should render ukefFacilityId link, linking to facility id', () => {
      params.facilities.forEach(({ facilitySnapshot: facility }) => {
        const selector = `[data-cy="facility-${facility._id}-ukef-facility-id-link"]`;

        wrapper.expectLink(selector).toLinkTo(
          `/case/${params.caseId}/facility/${facility._id}`,
          facility.ukefFacilityId,
        );
      });
    });

    describe('facilityProduct table cell', () => {
      it('should render value', () => {
        const facilities = params.facilities.filter(({ facilitySnapshot: f }) => f.facilityProduct.code !== '');

        facilities.forEach(({ facilitySnapshot: facility }) => {
          const cellSelector = `[data-cy="facility-${facility._id}-product"]`;
          wrapper.expectText(cellSelector).toRead(facility.facilityProduct.code);
        });
      });

      it('should render a dash when facilityProduct is empty', () => {
        const facility = params.facilities.find(({ facilitySnapshot: f }) => f.facilityProduct.code === '');

        const cellSelector = `[data-cy="facility-${facility._id}-type"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    describe('type table cell', () => {
      it('should render type when facility is bond', () => {
        const { facilitySnapshot: bond } = params.facilities.find(({ facilitySnapshot: f }) => f.facilityProduct.code === 'BSS');

        const cellSelector = `[data-cy="facility-${bond._id}-type"]`;
        wrapper.expectText(cellSelector).toRead(bond.type);
      });

      it('should render a dash when facility is loan', () => {
        const facility = params.facilities.find(({ facilitySnapshot: f }) => f.facilityProduct.code !== 'BSS');

        const cellSelector = `[data-cy="facility-${facility._id}-type"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    it('should render facilityStage table cell', () => {
      params.facilities.forEach(({ facilitySnapshot: facility }) => {
        const cellSelector = `[data-cy="facility-${facility._id}-stage"]`;
        wrapper.expectText(cellSelector).toRead(facility.facilityStage);
      });
    });

    it('should render tenor table cell', () => {
      params.facilities.forEach(({ facilitySnapshot: facility }) => {
        const cellSelector = `[data-cy="facility-${facility._id}-tenor"]`;
        wrapper.expectText(cellSelector).toRead(facility.dates.tenor);
      });
    });

    it('should render coverEndDate table cell', () => {
      params.facilities.forEach(({ facilitySnapshot: facility }) => {
        const cellSelector = `[data-cy="facility-${facility._id}-cover-end-date"]`;
        wrapper.expectText(cellSelector).toRead(facility.dates.coverEndDate);
      });
    });

    it('should render `value (export currency)` table cell', () => {
      params.facilities.forEach(({ facilitySnapshot: facility }) => {
        const cellSelector = `[data-cy="facility-${facility._id}-value-export-currency"]`;
        wrapper.expectText(cellSelector).toRead(facility.facilityValueExportCurrency);
      });
    });

    describe('`facilityValue in GBP` table cell', () => {
      it('should render', () => {
        const facilities = params.facilities.filter(({ facilitySnapshot: f }) => f.value !== '');

        facilities.forEach(({ facilitySnapshot: facility }) => {
          const cellSelector = `[data-cy="facility-${facility._id}-value-gbp"]`;
          wrapper.expectText(cellSelector).toRead(facility.value);
        });
      });

      it('should render a dash when facility Value is empty', () => {
        const facility = params.facilities.find(({ facilitySnapshot: f }) => f.value === '');

        const cellSelector = `[data-cy="facility-${facility._id}-value-gbp"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    it('should render ukefExposure', () => {
      params.facilities.forEach((facility) => {
        const cellSelector = `[data-cy="facility-${facility._id}-ukef-exposure"]`;
        wrapper.expectText(cellSelector).toRead(`${facility.tfm.ukefExposure.exposure}`);
      });
    });

    it('should render coveredPercentage', () => {
      params.facilities.forEach(({ facilitySnapshot: facility }) => {
        const cellSelector = `[data-cy="facility-${facility._id}-covered-percentage"]`;
        wrapper.expectText(cellSelector).toRead(`(${facility.coveredPercentage})`);
      });
    });
  });

  describe('totals row', () => {
    it('should render totals.facilitiesValueInGBP', () => {
      const cellSelector = '[data-cy="facilities-total-value"]';
      wrapper.expectText(cellSelector).toRead(params.totals.facilitiesValueInGBP);
    });

    it('should render totals.facilitiesUkefExposure', () => {
      const cellSelector = '[data-cy="facilities-total-ukef-exposure"]';
      wrapper.expectText(cellSelector).toRead(params.totals.facilitiesUkefExposure);
    });
  });
});
