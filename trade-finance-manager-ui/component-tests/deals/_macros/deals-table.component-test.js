const { componentRenderer } = require('../../componentRenderer');
const { formatDateString } = require('../../../server/nunjucks-configuration/filter-formatDateString');

const component = '../templates/deals/_macros/deals-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const params = {
    deals: [
      {
        _id: '123',
        dealSnapshot: {
          submissionType: 'Automatic Inclusion Notice',
          bank: {
            name: 'Bank name',
          },
          details: {
            ukefDealId: '0040004833',
          },
          submissionDetails: {
            supplierName: 'Supplier name',
            buyerName: 'Buyer name',
          },
          exporter: {
            companyName: 'test',
          },
        },
        tfm: {
          dateReceived: '13-07-2021',
          product: 'EWCS',
          stage: 'Confirmed',
        },
      },
      {
        _id: '456',
        dealSnapshot: {
          submissionType: 'Automatic Inclusion Notice',
          bank: {
            name: 'Bank name',
          },
          details: {
            ukefDealId: '0040004834',
          },
          submissionDetails: {
            supplierName: 'Supplier name',
            buyerName: 'Buyer name',
          },
          exporter: {
            companyName: 'test',
          },
        },
        tfm: {
          dateReceived: '13-07-2021',
          product: 'EWCS',
          stage: 'Confirmed',
        },
      },
    ],
    totals: {
      dealsValueInGBP: 'GBP 123,456.78',
      dealsUkefExposure: 'GBP 10,200.12',
    },
    user: {
      timezone: 'Europe/London',
    },
    sortButtonWasClicked: true,
    activeSortByField: 'dealSnapshot.ukefDealId',
    activeSortByOrder: 'ascending',
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headings', () => {
    it('should render `deal id` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-ukefDealId"]').toRead('Deal ID');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-ukefDealId"]').toEqual('ascending');
      wrapper.expectElement('[data-cy="deals-table-heading-ukefDealId-button"]').toHaveAttribute('autofocus', 'autofocus');
    });

    it('should render `product` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-product"]').toRead('Product');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-product"]').toEqual('none');
      wrapper.expectElement('[data-cy="deals-table-heading-product-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `type` table heading, but without sorting', () => {
      wrapper.expectText('[data-cy="deals-table-heading-type"]').toRead('Type');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-type"]').toEqual(undefined);
      wrapper.expectElement('[data-cy="deals-table-heading-type-button"]').notToExist();
    });

    it('should render `exporter` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-exporter"]').toRead('Exporter');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-exporter"]').toEqual('none');
      wrapper.expectElement('[data-cy="deals-table-heading-exporter-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `buyer` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-buyer"]').toRead('Buyer');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-buyer"]').toEqual('none');
      wrapper.expectElement('[data-cy="deals-table-heading-buyer-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `bank` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-bank"]').toRead('Bank');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-bank"]').toEqual('none');
      wrapper.expectElement('[data-cy="deals-table-heading-bank-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `stage` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-stage"]').toRead('Stage');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-stage"]').toEqual('none');
      wrapper.expectElement('[data-cy="deals-table-heading-stage-button"]').toHaveAttribute('autofocus', undefined);
    });

    it('should render `date received` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-dateReceived"]').toRead('Date received');
      wrapper.expectAriaSort('[data-cy="deals-table-heading-dateReceived"]').toEqual('none');
      wrapper.expectElement('[data-cy="deals-table-heading-dateReceived-button"]').toHaveAttribute('autofocus', undefined);
    });
  });

  describe('for each deal', () => {
    it('should render ukefDealId link, linking to deal id', () => {
      params.deals.forEach((deal) => {
        const selector = `[data-cy="deal-${deal._id}-ukef-deal-id-link"]`;

        wrapper.expectLink(selector).toLinkTo(`/case/${deal._id}/deal`, `View deal ${deal.dealSnapshot.details.ukefDealId} details`);
      });
    });

    describe('dealProduct table cell', () => {
      it('should render value', () => {
        params.deals.forEach((deal) => {
          const cellSelector = `[data-cy="deal-${deal._id}-product"]`;
          wrapper.expectText(cellSelector).toRead(deal.tfm.product);
        });
      });
    });

    describe('dealType table cell', () => {
      it('should render submissionType', () => {
        params.deals.forEach((deal) => {
          const cellSelector = `[data-cy="deal-${deal._id}-type"]`;
          wrapper.expectText(cellSelector).toRead(deal.dealSnapshot.submissionType);
        });
      });
    });

    it('should render exporter name table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-exporterName"]`;
        wrapper.expectText(cellSelector).toRead(deal.dealSnapshot.exporter.companyName);
      });
    });

    it('should render buyer name table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-buyerName"]`;
        wrapper.expectText(cellSelector).toRead(deal.dealSnapshot.submissionDetails.buyerName);
      });
    });

    it('should render buyer name table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-bank"]`;
        wrapper.expectText(cellSelector).toRead(deal.dealSnapshot.bank.name);
      });
    });

    it('should render dealStage table cell', () => {
      params.deals.forEach((deal) => {
        const cellSelector = `[data-cy="deal-${deal._id}-stage"]`;
        wrapper.expectText(cellSelector).toRead(deal.tfm.stage);
      });
    });

    describe('dateReceived table cell', () => {
      it('should render', () => {
        params.deals.forEach((deal) => {
          const cellSelector = `[data-cy="deal-${deal._id}-date-received"]`;
          const expected = formatDateString(deal.tfm.dateReceived, 'dd-MM-yyyy', 'd MMM yyyy');
          wrapper.expectText(cellSelector).toRead(expected);
        });
      });

      describe('when there is no dateReceived', () => {
        const dealWithNoDateReceived = {
          ...params.deals[0],
          tfm: {},
        };

        const paramsNoDate = {
          deals: [dealWithNoDateReceived],
          user: params.user,
        };

        beforeEach(() => {
          wrapper = render(paramsNoDate);
        });

        it('should render dash', () => {
          paramsNoDate.deals.forEach((deal) => {
            const cellSelector = `[data-cy="deal-${deal._id}-date-received"]`;
            wrapper.expectText(cellSelector).toRead('-');
          });
        });
      });
    });
  });

  describe('footer headings', () => {
    it('should render Cookies heading Contact Us', () => {
      wrapper.expectText('[data-cy="contact-us-footer"]').toRead('');
    });

    it('should render Cookies link under Contact Us', () => {
      wrapper.expectText('[data-cy="cookies-link"]').toRead('');
    });
    it('should render Accessibility Statement link under Contact Us', () => {
      wrapper.expectText('[data-cy="accessibility-statement-link"]').toRead('');
    });
  });
});
