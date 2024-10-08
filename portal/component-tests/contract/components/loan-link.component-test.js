const {
  ROLES: { MAKER },
} = require('@ukef/dtfs2-common');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

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
        itShouldRenderLoanNameAndHyperlink({
          loan: loanWithName,
          user,
          deal,
          editable: true,
        });
      });

      describe('when loan is not editable', () => {
        itShouldRenderLoanName({
          loan: loanWithName,
          user,
          deal,
          editable: false,
        });
      });
    });

    describe('when loan.name is not present', () => {
      describe('when loan is editable', () => {
        itShouldRenderLoanRefNotEnteredAndHyperlink({ loan: loanWithoutName, user, deal, editable: true });
      });

      describe('when loan is not editable', () => {
        itShouldRenderLoanRefNotEntered({ loan: loanWithoutName, user, deal, editable: false });
      });
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed as a %s', (nonMakerRole) => {
    const user = { roles: [nonMakerRole] };
    describe('when loan.name is present', () => {
      describe('when loan is editable', () => {
        itShouldRenderLoanName({
          loan: loanWithName,
          user,
          deal,
          editable: true,
        });
      });

      describe('when loan is not editable', () => {
        itShouldRenderLoanName({
          loan: loanWithName,
          user,
          deal,
          editable: false,
        });
      });
    });

    describe('when loan.name is not present', () => {
      describe('when loan is editable', () => {
        itShouldRenderLoanRefNotEntered({ loan: loanWithoutName, user, deal, editable: true });
      });

      describe('when loan is not editable', () => {
        itShouldRenderLoanRefNotEntered({ loan: loanWithoutName, user, deal, editable: false });
      });
    });
  });

  function itShouldRenderLoanNameAndHyperlink(params) {
    it('should render loan name and hyperlink', () => {
      const wrapper = render(params);

      wrapper
        .expectLink(`[data-cy="loan-bank-reference-number-link-${params.loan._id}"]`)
        .toLinkTo(`/contract/${params.deal._id}/loan/${params.loan._id}/guarantee-details`, params.loan.name);
    });
  }

  function itShouldRenderLoanName(params) {
    it('should render loan name', () => {
      const wrapper = render(params);

      wrapper.expectText(`[data-cy="loan-bank-reference-number-${params.loan._id}"]`).toRead(params.loan.name);
    });
  }

  function itShouldRenderLoanRefNotEnteredAndHyperlink(params) {
    it('should render "Loan’s reference number not entered" and hyperlink', () => {
      const wrapper = render(params);

      wrapper
        .expectLink(`[data-cy="loan-bank-reference-number-link-${params.loan._id}"]`)
        .toLinkTo(`/contract/${params.deal._id}/loan/${params.loan._id}/guarantee-details`, 'Loan’s reference number not entered');
    });
  }

  function itShouldRenderLoanRefNotEntered(params) {
    it('should render "Loan’s reference number not entered"', () => {
      const wrapper = render(params);

      wrapper.expectText(`[data-cy="loan-bank-reference-number-${params.loan._id}"]`).toRead('Loan’s reference number not entered');
    });
  }
});
