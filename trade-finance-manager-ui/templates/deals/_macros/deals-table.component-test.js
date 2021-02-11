/* eslint-disable no-underscore-dangle */
const componentRenderer = require('../../../component-tests/componentRenderer');

const component = '../templates/case/deal/_macros/deals-table.njk';

const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    deals: [
      {
        _id: '123',
        ukefdealID: '0040004833',
        dealProduct: {
          code: 'BSS',
        },
        coverEndDate: '02 Nov 2021',
        ukefExposure: 'GBP 1,234.00',
        coveredPercentage: '20%',
        dealType: 'Performance Bond',
        dealValue: 'GBP 1,234',
        dealValueExportCurrency: 'AUD 34000',
        dealStage: 'Commitment',
      },
      {
        _id: '456',
        ukefdealID: '0040004833',
        dealProduct: {
          code: 'EWCS',
        },
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%',
        dealValue: 'GBP 1,234',
        dealValueExportCurrency: 'AUD 34000',
        dealStage: 'Issued',
      },
      {
        _id: '789',
        ukefdealID: '0040004833',
        dealProduct: {
          code: 'EWCS',
        },
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%',
        dealValue: '',
        dealValueExportCurrency: 'AUD 34000',
        dealStage: 'Commitment',
      },
      {
        _id: '112',
        ukefdealID: '0040004833',
        dealProduct: {
          code: '',
        },
        coverEndDate: '04 Dec 2021',
        ukefExposure: 'GBP 2,469.00',
        coveredPercentage: '20%',
        dealValue: 'GBP 1,234',
        dealValueExportCurrency: 'AUD 34000',
        dealStage: 'Issued',
      },
    ],
    totals: {
      dealsValueInGBP: 'GBP 123,456.78',
      dealsUkefExposure: 'GBP 10,200.12',
    },
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headings', () => {
    it('should render `deal id` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-deal-id"]').toRead('deal ID');
    });

    it('should render `product` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-product"]').toRead('Product');
    });

    it('should render `type` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-type"]').toRead('Type');
    });

    it('should render `stage` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-stage"]').toRead('Stage');
    });

    it('should render `tenor` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-tenor"]').toRead('Tenor');
    });

    it('should render `cover end date` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-cover-end-date"]').toRead('Cover end date');
    });

    it('should render `value (export currency)` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-value-export-currency"]').toRead('Value (export currency)');
    });

    it('should render `value (GBP)` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-value-gbp"]').toRead('Value (GBP)');
    });

    it('should render `UKEF exposure` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-ukef-exposure"]').toRead('UKEF exposure');
    });
  });


  describe('for each deal', () => {
    it('should render ukefdealID link, linking to deal id', () => {
      params.deals.forEach((deal) => {
        const selector = `[data-cy="deal-${deal._id}-ukef-deal-id-link"]`;

        wrapper.expectLink(selector).toLinkTo(
          `/case/deal/${deal._id}`,
          deal.ukefdealID,
        );
      });
    });

    describe('dealProduct table cell', () => {
      it('should render value', () => {
        const deals = params.deals.filter((f) => f.dealProduct.code !== '');

        deals.forEach((deal) => {
          const cellSelector = `[data-cy="deal-${deal._id}-product"]`;
          wrapper.expectText(cellSelector).toRead(deal.dealProduct.code);
        });
      });

      it('should render a dash when dealProduct is empty', () => {
        const deal = params.deals.find((f) => f.dealProduct.code === '');

        const cellSelector = `[data-cy="deal-${deal._id}-type"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    describe('dealType table cell', () => {
      it('should render dealType when deal is bond', () => {
        const bond = params.deals.find((f) => f.dealProduct.code === 'BSS');

        const cellSelector = `[data-cy="deal-${bond._id}-type"]`;
        wrapper.expectText(cellSelector).toRead(bond.dealType);
      });

      it('should render a dash when deal is loan', () => {
        const deal = params.deals.find((f) => f.dealProduct.code !== 'BSS');

        const cellSelector = `[data-cy="deal-${deal._id}-type"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });

    it('should render dealStage table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-stage"]`;
        wrapper.expectText(cellSelector).toRead(deal.dealStage);
      });
    });

    it('should render coverEndDate table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-cover-end-date"]`;
        wrapper.expectText(cellSelector).toRead(`${deal.coverEndDate} (expected)`);
      });
    });

    it('should render `value (export currency)` table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-value-export-currency"]`;
        wrapper.expectText(cellSelector).toRead(deal.dealValueExportCurrency);
      });
    });

    describe('`dealValue in GBP` table cell', () => {
      it('should render', () => {
        const deals = params.deals.filter((f) => f.dealValue !== '');

        deals.forEach((deal) => {
          const cellSelector = `[data-cy="deal-${deal._id}-value-gbp"]`;
          wrapper.expectText(cellSelector).toRead(deal.dealValue);
        });
      });

      it('should render a dash when dealValue is empty', () => {
        const deal = params.deals.find((f) => f.dealValue === '');

        const cellSelector = `[data-cy="deal-${deal._id}-value-gbp"]`;
        wrapper.expectText(cellSelector).toRead('-');
      });
    });


    it('should render ukefExposure', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-ukef-exposure"]`;
        wrapper.expectText(cellSelector).toRead(`${deal.ukefExposure}`);
      });
    });

    it('should render coveredPercentage', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-covered-percentage"]`;
        wrapper.expectText(cellSelector).toRead(`(${deal.coveredPercentage})`);
      });
    });
  });

  describe('totals row', () => {
    it('should render totals.dealsValueInGBP', () => {
      const cellSelector = '[data-cy="deals-total-value"]';
      wrapper.expectText(cellSelector).toRead(params.totals.dealsValueInGBP);
    });

    it('should render totals.dealsUkefExposure', () => {
      const cellSelector = '[data-cy="deals-total-ukef-exposure"]';
      wrapper.expectText(cellSelector).toRead(params.totals.dealsUkefExposure);
    });
  });
});
