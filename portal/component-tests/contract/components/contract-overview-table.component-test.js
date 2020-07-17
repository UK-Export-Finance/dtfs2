const moment = require('moment');
require('moment-timezone');// monkey-patch to provide moment().tz()

const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/contract-overview-table.njk';
const render = componentRenderer(component);
describe(component, () => {
  describe('renders all the details of a deal', () => {
    let wrapper;

    const now = moment();

    const deal = {
      details: {
        bankSupplyContractID: 'bankSupplyContractID',
        ukefDealId: 'ukefDealId',
        status: 'status',
        previousStatus: 'previousStatus',
        maker: {
          firstname: 'Robert',
          surname: 'Bruce',
        },
        checker: {
          firstname: 'Rabbie',
          surname: 'Burns',
        },
        submissionDate: now.valueOf(),
        dateOfLastAction: now.valueOf(),
      }
    };

    beforeAll( () => {
      const user = {timezone:'Europe/London'};
      wrapper = render({deal, user});
    })

    it("displays deal.details.bankSupplyContractID", () =>{
      return wrapper.expectText('[data-cy="bankSupplyContractID"]')
                    .toRead(deal.details.bankSupplyContractID);
    });

    it("displays deal.details.ukefDealId", () =>{
      return wrapper.expectText('[data-cy="ukefDealId"]')
                    .toRead(deal.details.ukefDealId);
    });

    it("displays deal.details.status", () =>{
      return wrapper.expectText('[data-cy="status"]')
                    .toRead(deal.details.status);
    });

    it("displays deal.details.previousStatus", () =>{
      return wrapper.expectText('[data-cy="previousStatus"]')
                    .toRead(deal.details.previousStatus);
    });

    it("displays deal.details.maker.username", () =>{
      return wrapper.expectText('[data-cy="maker"]')
                    .toRead(`${deal.details.maker.firstname} ${deal.details.maker.surname}`);
    });

    it("displays deal.details.checker", () =>{
      return wrapper.expectText('[data-cy="checker"]')
                    .toRead(`${deal.details.checker.firstname} ${deal.details.checker.surname}`);
    });

    it("displays deal.details.submissionDate", () =>{
      return wrapper.expectText('[data-cy="submissionDate"]')
                    .toRead(moment(deal.details.submissionDate)
                                      .tz('Europe/London')
                                      .format('DD/MM/YYYY'));
    });

    it("displays deal.details.dateOfLastAction", () =>{
      return wrapper.expectText('[data-cy="dateOfLastAction"]')
                    .toRead(moment(deal.details.dateOfLastAction)
                                      .tz('Europe/London')
                                      .format('DD/MM/YYYY HH:mm'));
    });

  });

  describe('renders - for any blank fields', () => {
    let wrapper;

    const now = moment();

    const deal = {
      details: {
        bankSupplyContractID: '',
        ukefDealId: ' ',
        status: '   ',
        previousStatus: '',
        maker: {},
        checker: {},
        submissionDate: '',
        dateOfLastAction: '',
      }
    };

    beforeAll( () => {
      const user = {timezone:'Europe/London'};
      wrapper = render({deal, user});
    })

    it("displays deal.details.bankSupplyContractID", () =>{
      return wrapper.expectText('[data-cy="bankSupplyContractID"]')
                    .toRead("-");
    });

    it("displays deal.details.ukefDealId", () =>{
      return wrapper.expectText('[data-cy="ukefDealId"]')
                    .toRead("-");
    });

    it("displays deal.details.status", () =>{
      return wrapper.expectText('[data-cy="status"]')
                    .toRead("-");
    });

    it("displays deal.details.previousStatus", () =>{
      return wrapper.expectText('[data-cy="previousStatus"]')
                    .toRead("-");
    });

//TODO - can't instantly think how to do this properly;
//  possibly a filter to generate 'name' from our user that can - if we dont have the data?
    // it("displays deal.details.maker.username", () =>{
    //   return wrapper.expectText('[data-cy="maker"]')
    //                 .toRead("-");
    // });
    //
    // it("displays deal.details.checker", () =>{
    //   return wrapper.expectText('[data-cy="checker"]')
    //                 .toRead("-");
    // });

    it("displays deal.details.submissionDate", () =>{
      return wrapper.expectText('[data-cy="submissionDate"]')
                    .toRead("-");
    });

    it("displays deal.details.dateOfLastAction", () =>{
      return wrapper.expectText('[data-cy="dateOfLastAction"]')
                    .toRead("-");
    });

  });

});
