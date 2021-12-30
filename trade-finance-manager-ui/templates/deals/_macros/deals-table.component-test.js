/* eslint-disable no-underscore-dangle */
const componentRenderer = require('../../../component-tests/componentRenderer');
const formatDateString = require('../../../server/nunjucks-configuration/filter-formatDateString');

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
  };

  beforeEach(() => {
    wrapper = render(params);
  });

  describe('table headings', () => {
    it('should render `deal id` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-ukefDealId"]').toRead('Deal ID');
    });

    it('should render `product` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-product"]').toRead('Product');
    });

    it('should render `type` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-type"]').toRead('Type');
    });

    it('should render `exporter` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-exporter"]').toRead('Exporter');
    });

    it('should render `buyer` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-buyer"]').toRead('Buyer');
    });

    it('should render `bank` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-bank"]').toRead('Bank');
    });

    it('should render `stage` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-stage"]').toRead('Stage');
    });

    it('should render `date received` table heading', () => {
      wrapper.expectText('[data-cy="deals-table-heading-date-received"]').toRead('Date received');
    });
  });


  describe('for each deal', () => {
    it('should render ukefDealId link, linking to deal id', () => {
      params.deals.forEach((deal) => {
        const selector = `[data-cy="deal-${deal._id}-ukef-deal-id-link"]`;

        wrapper.expectLink(selector).toLinkTo(
          `/case/${deal._id}/deal`,
          deal.dealSnapshot.details.ukefDealId,
        );
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
          const expected = formatDateString(deal.tfm.dateReceived, 'DD-MM-YYYY', 'D MMM YYYY');
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
});
