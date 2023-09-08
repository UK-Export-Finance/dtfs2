const { MAKER } = require('../../../server/constants/roles');
const { NON_MAKER_ROLES } = require('../../helpers/common-role-lists');

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/loan-link.njk';
const render = componentRenderer(component);

describe(component, () => {
  const deal = { _id: '61f6fbaea2460c018a4189d7' };
  const loanWithName = { _id: '61f6fbaea2460c018a4189da', name: 'Test Loan Name' };
  const loanWithoutName = { _id: '61f6fbaea2460c018a4189db' };

  describe('when viewed as a maker', () => {
    const user = { roles: [MAKER] };

    describe('when loan.name is present', () => {
      describe('when loan is editable', () => {
        const params = {
          user,
          deal,
          editable: true,
        };
        itShouldRenderLoanNameAndHyperlink(params, loanWithName);
      });

      describe('when loan is not editable', () => {
        const params = {
          user,
          deal,
          editable: false,
        };
        itShouldRenderLoanName(params, loanWithName);
      });
    });

    describe('when loan.name is not present', () => {
      describe('when loan is editable', () => {
        const params = {
          user,
          deal,
          editable: true,
        };
        itShouldRenderLoanRefNotEnteredAndHyperlink(params, loanWithoutName);
      });

      describe('when loan is not editable', () => {
        const params = {
          user,
          deal,
          editable: false,
        };
        itShouldRenderLoanRefNotEntered(params, loanWithoutName);
      });
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed as a %s', (nonMakerRole) => {
    const user = { roles: [nonMakerRole] };
    describe('when loan.name is present', () => {
      describe('when loan is editable', () => {
        const params = {
          user,
          deal,
          editable: true,
        };
        itShouldRenderLoanName(params, loanWithName);
      });

      describe('when loan is not editable', () => {
        const params = {
          user,
          deal,
          editable: false,
        };
        itShouldRenderLoanName(params, loanWithName);
      });
    });

    describe('when loan.name is not present', () => {
      describe('when loan is editable', () => {
        const params = {
          user,
          deal,
          editable: true,
        };
        itShouldRenderLoanRefNotEntered(params, loanWithoutName);
      });

      describe('when loan is not editable', () => {
        const params = {
          user,
          deal,
          editable: false,
        };
        itShouldRenderLoanRefNotEntered(params, loanWithoutName);
      });
    });
  });

  function itShouldRenderLoanNameAndHyperlink(params, loan) {
    it('should render loan name and hyperlink', () => {
      const wrapper = render({
        params,
        loan,
      });

      wrapper
        .expectLink(`[data-cy="loan-bank-reference-number-link-${loan._id}"]`)
        .toLinkTo(`/contract/${deal._id}/loan/${loan._id}/guarantee-details`, loan.name);
    });
  }

  function itShouldRenderLoanName(params, loan) {
    it('should render loan name', () => {
      const wrapper = render({
        params,
        loan,
      });

      wrapper.expectText(`[data-cy="loan-bank-reference-number-${loan._id}"]`).toRead(loan.name);
    });
  }

  function itShouldRenderLoanRefNotEnteredAndHyperlink(params, loan) {
    it('should render "Loan’s reference number not entered" and hyperlink', () => {
      const wrapper = render({
        params,
        loan,
      });

      wrapper
        .expectLink(`[data-cy="loan-bank-reference-number-link-${loan._id}"]`)
        .toLinkTo(`/contract/${deal._id}/loan/${loan._id}/guarantee-details`, 'Loan’s reference number not entered');
    });
  }

  function itShouldRenderLoanRefNotEntered(params, loan) {
    it('should render "Loan’s reference number not entered"', () => {
      const wrapper = render({
        params,
        loan,
      });

      wrapper.expectText(`[data-cy="loan-bank-reference-number-${loan._id}"]`).toRead('Loan’s reference number not entered');
    });
  }
});
