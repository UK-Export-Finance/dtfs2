const pageRenderer = require('../pageRenderer');
const page = 'contract/contract-view.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;

  const deal = {
    _id: 123456,
    details: {
      bankSupplyContractName: 'bankId123',
      bankSupplyContractID: '321',
      maker: {username: 'bob'},
      submissionDate: '01/01/2020',
      dateOfLastAction: '02/02/2020 12:12',
    },
    bondTransactions: {
      items: [
      {
          _id: "1234567891",
          bondIssuer: "issuer",
          bondType: "bond type",
          bondStage: "unissued",
          ukefGuaranteeInMonths: "24",
          uniqueIdentificationNumber: "1234",
          bondBeneficiary: "test",
          bondValue: "123",
          transactionCurrencySameAsSupplyContractCurrency: "true",
          riskMarginFee: "1",
          coveredPercentage: "2",
          feeType: "test",
          feeFrequency: "test",
          dayCountBasis: "test"
      }
    ]
  }
  };

  describe('viewed by a maker:', () => {
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

    it('allows the user to add a loan', () => {
      wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-loan"]').toLinkTo(`/contract/${deal._id}/loan/create`, 'Add a Loan');
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

    it('hides the link to add a bond', () => {
      wrapper.expectButtonDisguisedAsALink('[data-cy="button-add-loan"]').notToExist();
    });
  });

});
