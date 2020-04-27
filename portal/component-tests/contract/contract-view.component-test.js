const pageRenderer = require('../pageRenderer');
const page = 'contract/contract-view.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const deal = {
    details: {
      bankSupplyContractName: 'bankId123',
      bankSupplyContractID: '321',
      maker: {username: 'bob'},
      submissionDate: '01/01/2020',
      dateOfLastAction: '02/02/2020 12:12',
    }
  };

  const user = {
    roles:['maker'],
  };

  beforeAll( ()=>{
    wrapper = render({user, deal})
  });

  it('displays bankSupplyContractName', () => {
    wrapper.expectText('[data-cy="bankSupplyContractName"]').toRead('bankId123');
  });

  it('displays bankSupplyContractID', () => {
    wrapper.expectText('[data-cy="bankSupplyContractID"]').toRead('321');
  });

  it('displays the maker', () => {
    wrapper.expectText('[data-cy="maker"]').toRead('bob');
  });

  it('displays the submissionDate', () => {
    const regexDate = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d]/
    wrapper.expectText('[data-cy="submissionDate"]').toMatch(regexDate);
  });

  it('displays the dateOfLastAction', () => {
    const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/
    wrapper.expectText('[data-cy="dateOfLastAction"]').toMatch(regexDateTime);
  });

});
