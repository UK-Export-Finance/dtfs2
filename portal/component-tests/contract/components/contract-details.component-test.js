const componentRenderer = require('../../componentRenderer');
const component = 'contract/components/contract-details.njk';
const render = componentRenderer(component);

describe(component, () => {
  let wrapper;
  const deal = {
    details: {
      bankSupplyContractID: 'bankSupplyContractID',
      ukefDealId: 'ukefDealId',
      status: 'status',
      previousStatus: 'previousStatus',
      maker: {
        username: 'maker',
      },
      checker: 'should be checker.username?',
      submissionDate: 'submissionDate',
      dateOfLastAction: 'dateOfLastAction',
      submissionType:'submissionType',
    }
  };

  beforeAll( () => {
    wrapper = render({deal});
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
                  .toRead(deal.details.maker.username);
  });

  //TODO feels like this isn't wired in, or would be same shape as maker^?
  it("displays deal.details.checker", () =>{
    return wrapper.expectText('[data-cy="checker"]')
                  .toRead(deal.details.checker);
  });

  it("displays deal.details.submissionDate", () =>{
    return wrapper.expectText('[data-cy="submissionDate"]')
                  .toRead(deal.details.submissionDate);
  });

  it("displays deal.details.dateOfLastAction", () =>{
    return wrapper.expectText('[data-cy="dateOfLastAction"]')
                  .toRead(deal.details.dateOfLastAction);
  });

  it("displays deal.details.submissionType", () =>{
    return wrapper.expectText('[data-cy="submissionType"]')
                  .toRead(deal.details.submissionType);
  });

});
