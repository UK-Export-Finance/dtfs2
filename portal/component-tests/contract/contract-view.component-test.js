const pageRenderer = require('../pageRenderer');
const page = 'contract/contract-view.njk';
const render = pageRenderer(page);
const deal = require('../fixtures/deal-fully-completed');
// const {STATUS} = require('../../server/constants');
import STATUS from '../../server/constants';
const aDealInStatus = (status) => {
  return {
    ...deal,
    details: {
      ...deal.details,
      status: status,
    }
  };
};

const oneDealInEachStatus = () => {
  return [
    aDealInStatus(STATUS.draft),
    aDealInStatus(STATUS.readyForApproval),
    aDealInStatus(STATUS.inputRequired),
    aDealInStatus(STATUS.abandoned),
    aDealInStatus(STATUS.submitted),
    aDealInStatus(STATUS.submissionAcknowledged),
    aDealInStatus(STATUS.approved),
    aDealInStatus(STATUS.approvedWithConditions),
    aDealInStatus(STATUS.refused),
  ];
};

const roles = ['maker','checker'];

describe(page, () => {
  describe('always', () => {
    const wrappers = [];

    beforeAll( ()=>{
      for(const role of roles) {
        const user = { roles:[role] };
        for(const deal of oneDealInEachStatus()) {
          wrappers.push( render({user, deal}) )
        }
      }
    });

    it('displays bankSupplyContractName', () => {
      return wrappers.forEach(wrapper => wrapper.expectText('[data-cy="bankSupplyContractName"]')
                                          .toRead(deal.details.bankSupplyContractName));
    });

    it('displays bankSupplyContractID', () => {
      return wrappers.forEach(wrapper => wrapper.expectText('[data-cy="bankSupplyContractID"]')
                                          .toRead(deal.details.bankSupplyContractID));
    });

    it('displays the maker', () => {
      return wrappers.forEach(wrapper => wrapper.expectText('[data-cy="maker"]')
                                          .toRead(deal.details.maker.username));
    });

    it('displays the submissionDate', () => {
      const regexDate = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d]/
      return wrappers.forEach(wrapper => wrapper.expectText('[data-cy="submissionDate"]')
                                          .toMatch(regexDate));
    });

    it('displays the dateOfLastAction', () => {
      const regexDateTime = /[\d][\d]\/[\d][\d]\/[\d][\d][\d][\d] [\d][\d]:[\d][\d]/
      return wrappers.forEach(wrapper => wrapper.expectText('[data-cy="dateOfLastAction"]')
                                        .toMatch(regexDateTime));
    });

  });

  describe('when viewed with editable=true', () => {
    const wrappers = [];

    beforeAll( ()=>{
      for(const role of roles) {
        const user = { roles:[role] };
        for(const deal of oneDealInEachStatus()) {
          wrappers.push( render({user, deal, editable:true}) )
        }
      }
    });

    it('links to the about supply contract section', () => {
      return wrappers.forEach(wrapper => wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]')
                                          .toLinkTo(`/contract/${deal._id}/about/supplier`, 'View details'));
    });

    it('links to the eligibility criteria section', () => {
      return wrappers.forEach(wrapper => wrapper.expectLink('[data-cy="ViewDetails"]')
                                          .toLinkTo(`/contract/${deal._id}/eligibility/criteria`, 'View details'));
    });

    it('allows the user to add a bond', () => {
      return wrappers.forEach(wrapper => wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-bond"]')
                                          .toLinkTo(`/contract/${deal._id}/bond/create`, 'Add a Bond'));
    });

    it('allows the user to delete a bond', () => {
      const dealId = deal._id;
      const bondId = deal.bondTransactions.items[0]._id;

      return wrappers.forEach(wrapper => wrapper.expectLink(`[data-cy="delete-bond-${bondId}"]`)
                                          .toLinkTo(`/contract/${dealId}/bond/${bondId}/delete`, 'Delete'));
    });

    it('provides a link to the bond', () => {
      const dealId = deal._id;
      const bondId = deal.bondTransactions.items[0]._id;

      return wrappers.forEach(wrapper => wrapper.expectLink(`[data-cy="unique-number-${bondId}"]`)
                        .toLinkTo(`/contract/${dealId}/bond/${bondId}/details`, deal.bondTransactions.items[0].uniqueIdentificationNumber));


    });

    it('allows the user to add a loan', () => {
      return wrappers.forEach(wrapper => wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-loan"]')
                        .toLinkTo(`/contract/${deal._id}/loan/create`, 'Add a Loan'));
    });

    it('provides a link to the loan', () => {
      const dealId = deal._id;
      const loanId = deal.loanTransactions.items[0]._id;

      return wrappers.forEach(wrapper => wrapper.expectLink(`[data-cy="loan-bank-reference-number-${loanId}"]`)
                .toLinkTo(`/contract/${dealId}/loan/${loanId}/guarantee-details`, deal.loanTransactions.items[0].bankReferenceNumber));
    });

  });


  describe('when viewed with editable=false', () => {
    const wrappers = [];

    beforeAll( ()=>{
      for(const role of roles) {
        const user = { roles:[role] };
        for(const deal of oneDealInEachStatus()) {
          wrappers.push( render({user, deal, editable:false}) )
        }
      }
    });

    it('hides the link to the about supply contract section', () => {
      return wrappers.forEach(wrapper => wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]').notToExist());
    });

    it('hides the link to the eligibility criteria section', () => {
      return wrappers.forEach(wrapper => wrapper.expectLink('[data-cy="ViewDetails"]').notToExist());
    });

    it('hides the link to add a bond', () => {
      return wrappers.forEach(wrapper => wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-bond"]').notToExist());
    });

    it('hides the link to delete a bond', () => {
      const bondId = deal.bondTransactions.items[0]._id;
      return wrappers.forEach(wrapper => wrapper.expectLink(`[data-cy="delete-bond-${bondId}"]`).notToExist());
    });

    it('hides the link to the bond', () => {
      const bondId = deal.bondTransactions.items[0]._id;
      return wrappers.forEach(wrapper => wrapper.expectLink(`[data-cy="unique-number-${bondId}"]`).notToExist());
    });

    it('hides the link to add a loan', () => {
      return wrappers.forEach(wrapper => wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-loan"]').notToExist());
    });

    it('hides the link to the loan', () => {
      const dealId = deal._id;
      const loanId = deal.loanTransactions.items[0]._id;

      return wrappers.forEach(wrapper => wrapper.expectLink(`[data-cy="loan-bank-reference-number-${loanId}"]`).notToExist());
    });

  });

});
