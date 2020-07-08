const getApplicationGroup = require('../../../../src/v1/controllers/integration/helpers/get-application-group');

describe('get application group helper', () => {
  const bondTransactions = {
    items: [{ id: 1 }, { id: 2 }],
  };
  const loanTransactions = {
    items: [{ id: 3 }, { id: 4 }],
  };

  const noTransactions = { items: [] };

  it('should return the correct application group for deal with bonds & loans', () => {
    const bondAndLoan = getApplicationGroup({ bondTransactions, loanTransactions });
    const bondOnly = getApplicationGroup({ bondTransactions, loanTransactions: noTransactions });
    const loanOnly = getApplicationGroup({ bondTransactions: noTransactions, loanTransactions });
    const noBondOrLoan = getApplicationGroup({ bondTransactions: noTransactions, loanTransactions: noTransactions });

    expect(bondAndLoan).toEqual('BSS and EWCS');
    expect(bondOnly).toEqual('BSS');
    expect(loanOnly).toEqual('EWCS');
    expect(noBondOrLoan).toEqual(false);
  });
});
