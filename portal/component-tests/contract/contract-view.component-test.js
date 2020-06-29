const pageRenderer = require('../pageRenderer');
const page = 'contract/contract-view.njk';
const render = pageRenderer(page);
const deal = require('../fixtures/deal-fully-completed');

describe(page, () => {
  let wrapper;

  describe('viewed by a maker:', () => {
    const user = {
      roles:['maker'],
    };

    beforeAll( ()=>{
      wrapper = render({user, deal})
    });

    it('displays bankSupplyContractName', () => {
      wrapper.expectText('[data-cy="bankSupplyContractName"]').toRead(deal.details.bankSupplyContractName);
    });

    it('displays bankSupplyContractID', () => {
      wrapper.expectText('[data-cy="bankSupplyContractID"]').toRead(deal.details.bankSupplyContractID);
    });

    it('displays the maker', () => {
      wrapper.expectText('[data-cy="maker"]').toRead(deal.details.maker.username);
    });

    it('displays the submissionDate', () => {
      const regexDate = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d]/
      wrapper.expectText('[data-cy="submissionDate"]').toMatch(regexDate);
    });

    it('displays the dateOfLastAction', () => {
      const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/
      wrapper.expectText('[data-cy="dateOfLastAction"]').toMatch(regexDateTime);
    });

    it('links to the about supply contract section', () => {
      wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]').toLinkTo(`/contract/${deal._id}/about/supplier`, 'View details');
    });

    it('links to the eligibility criteria section', () => {
      wrapper.expectLink('[data-cy="ViewDetails"]').toLinkTo(`/contract/${deal._id}/eligibility/criteria`, 'View details');
    });

    it('allows the user to add a bond', () => {
      wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-bond"]').toLinkTo(`/contract/${deal._id}/bond/create`, 'Add a Bond');
    });

    it('allows the user to delete a bond', () => {
      const dealId = deal._id;
      const bondId = deal.bondTransactions.items[0]._id;

      wrapper.expectLink(`[data-cy="delete-bond-${bondId}"]`).toLinkTo(`/contract/${dealId}/bond/${bondId}/delete`, 'Delete');
    });

    it('provides a link to the bond', () => {
      const dealId = deal._id;
      const bondId = deal.bondTransactions.items[0]._id;

      wrapper.expectLink(`[data-cy="unique-number-${bondId}"]`).toLinkTo(`/contract/${dealId}/bond/${bondId}/details`, deal.bondTransactions.items[0].uniqueIdentificationNumber);
    });

    it('allows the user to add a loan', () => {
      wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-loan"]').toLinkTo(`/contract/${deal._id}/loan/create`, 'Add a Loan');
    });

    it('provides a link to the loan', () => {
      const dealId = deal._id;
      const loanId = deal.loanTransactions.items[0]._id;

      wrapper.expectLink(`[data-cy="loan-bank-reference-number-${loanId}"]`).toLinkTo(`/contract/${dealId}/loan/${loanId}/guarantee-details`, deal.loanTransactions.items[0].bankReferenceNumber);
    });

  });

  describe('viewed by a checker:', () => {
    const user = {
      roles:['checker'],
    };

    beforeAll( ()=>{
      wrapper = render({user, deal})
    });

    it('displays bankSupplyContractName', () => {
      wrapper.expectText('[data-cy="bankSupplyContractName"]').toRead(deal.details.bankSupplyContractName);
    });

    it('displays bankSupplyContractID', () => {
      wrapper.expectText('[data-cy="bankSupplyContractID"]').toRead(deal.details.bankSupplyContractID);
    });

    it('displays the maker', () => {
      wrapper.expectText('[data-cy="maker"]').toRead(deal.details.maker.username);
    });

    it('displays the submissionDate', () => {
      const regexDate = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d]/
      wrapper.expectText('[data-cy="submissionDate"]').toMatch(regexDate);
    });

    it('displays the dateOfLastAction', () => {
      const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/
      wrapper.expectText('[data-cy="dateOfLastAction"]').toMatch(regexDateTime);
    });

    it('hides the link to the about supply contract section', () => {
      wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]').notToExist();
    });

    it('hides the link to the eligibility criteria section', () => {
      wrapper.expectLink('[data-cy="ViewDetails"]').notToExist();
    });

    it('hides the link to add a bond', () => {
      wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-bond"]').notToExist();
    });

    it('hides the link to delete a bond', () => {
      const bondId = deal.bondTransactions.items[0]._id;
      wrapper.expectLink(`[data-cy="delete-bond-${bondId}"]`).notToExist();
    });

    it('hides the link to the bond', () => {
      const dealId = deal._id;
      const bondId = deal.bondTransactions.items[0]._id;

      wrapper.expectLink(`[data-cy="unique-number-${bondId}"]`).notToExist();
    });

    it('hides the link to add a bond', () => {
      wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-loan"]').notToExist();
    });

    it('hides the link to the loan', () => {
      const dealId = deal._id;
      const loanId = deal.loanTransactions.items[0]._id;

      wrapper.expectLink(`[data-cy="loan-bank-reference-number-${loanId}"]`).notToExist();
    });

  });

});
