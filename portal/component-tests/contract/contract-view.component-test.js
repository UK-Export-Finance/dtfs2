import dealFullyCompleted from '../fixtures/deal-fully-completed';

const { ROLES, timezoneConfig } = require('@ukef/dtfs2-common');
const { STATUS } = require('../../server/constants');
const pageRenderer = require('../pageRenderer');

const page = 'contract/contract-view.njk';
const render = pageRenderer(page);
const { NON_MAKER_ROLES } = require('../../test-helpers/common-role-lists');

const { MAKER, CHECKER } = ROLES;

const mockDeal = { _id: '61f6fbaea2460c018a4189d7', ...dealFullyCompleted };
mockDeal.bondTransactions.items[0]._id = '61f6fbaea2460c018a4189d8';

const aDealInStatus = (status) => ({
  ...mockDeal,
  status,
});

const oneDealInEachStatus = () => [
  aDealInStatus(STATUS.DEAL.DRAFT),
  aDealInStatus(STATUS.DEAL.READY_FOR_APPROVAL),
  aDealInStatus(STATUS.DEAL.CHANGES_REQUIRED),
  aDealInStatus(STATUS.DEAL.ABANDONED),
  aDealInStatus(STATUS.DEAL.SUBMITTED_TO_UKEF),
  aDealInStatus(STATUS.DEAL.UKEF_ACKNOWLEDGED),
  aDealInStatus(STATUS.DEAL.UKEF_APPROVED_WITHOUT_CONDITIONS),
  aDealInStatus(STATUS.DEAL.UKEF_APPROVED_WITH_CONDITIONS),
  aDealInStatus(STATUS.DEAL.UKEF_REFUSED),
];

const confirmedRequestStartDateParams = {
  confirmedRequestedCoverStartDates: [],
  allRequestedCoverStartDatesConfirmed: true,
};

describe(page, () => {
  describe("when viewed as a 'maker'", () => {
    const user = { roles: [MAKER], timezone: timezoneConfig.DEFAULT };

    commonTests(user);

    describe('when viewed with editable=true', () => {
      const wrappers = [];
      beforeAll(() => {
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              deal,
              editable: true,
              ...confirmedRequestStartDateParams,
            }),
          );
        }
      });

      it('provides a link to the loan', () => {
        const dealId = mockDeal._id;
        const loanId = mockDeal.loanTransactions.items[0]._id;

        return wrappers.forEach((wrapper) =>
          wrapper
            .expectLink(`[data-cy="loan-bank-reference-number-link-${loanId}"]`)
            .toLinkTo(`/contract/${dealId}/loan/${loanId}/guarantee-details`, mockDeal.loanTransactions.items[0].name),
        );
      });
    });
  });

  describe("when viewed as a 'checker'", () => {
    const user = { roles: [CHECKER], timezone: timezoneConfig.DEFAULT };

    commonTests(user);

    describe('when viewed with editable=true', () => {
      const wrappers = [];
      beforeAll(() => {
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              deal,
              editable: true,
              ...confirmedRequestStartDateParams,
            }),
          );
        }
      });

      it('does not provide a link to the loan', () => {
        const loanId = mockDeal.loanTransactions.items[0]._id;

        return wrappers.forEach((wrapper) => {
          wrapper.expectLink(`[data-cy="loan-bank-reference-number-link-${loanId}"]`).notToExist();
          wrapper.expectText(`[data-cy="loan-bank-reference-number-${loanId}"]`).toRead(mockDeal.loanTransactions.items[0].name);
        });
      });
    });
  });

  describe.each(NON_MAKER_ROLES)("when viewed as a '%s'", (nonMakerRole) => {
    const user = { roles: [nonMakerRole], timezone: timezoneConfig.DEFAULT };

    commonTests(user);

    describe('when viewed with editable=true', () => {
      const wrappers = [];
      beforeAll(() => {
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              deal,
              editable: true,
              ...confirmedRequestStartDateParams,
            }),
          );
        }
      });

      it('does not provide a link to the loan', () => {
        const loanId = mockDeal.loanTransactions.items[0]._id;

        return wrappers.forEach((wrapper) => {
          wrapper.expectLink(`[data-cy="loan-bank-reference-number-link-${loanId}"]`).notToExist();
          wrapper.expectText(`[data-cy="loan-bank-reference-number-${loanId}"]`).toRead(mockDeal.loanTransactions.items[0].name);
        });
      });
    });
  });

  function commonTests(user) {
    describe('always', () => {
      const wrappers = [];

      beforeAll(() => {
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              deal,
              ...confirmedRequestStartDateParams,
            }),
          );
        }
      });

      it('displays additionalRefName', () =>
        wrappers.forEach((wrapper) => wrapper.expectText('[data-cy="additionalRefName"]').toRead(mockDeal.additionalRefName)));

      it('should render contract overview table', () => wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="contract-overview-table"]').toExist()));

      it('should render Summary Table component', () => wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="summary-table"]').toExist()));

      it('should render Forms Incomplete text component', () =>
        wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="forms-incomplete-text"]').toExist()));
    });

    describe('when viewed with editable=true', () => {
      const wrappers = [];
      beforeAll(() => {
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              deal,
              editable: true,
              ...confirmedRequestStartDateParams,
            }),
          );
        }
      });

      it('links to the about supply contract section', () =>
        wrappers.forEach((wrapper) =>
          wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]').toLinkTo(`/contract/${mockDeal._id}/about/supplier`, 'View details'),
        ));

      it('links to the eligibility criteria section', () =>
        wrappers.forEach((wrapper) =>
          wrapper.expectLink('[data-cy="ViewDetails"]').toLinkTo(`/contract/${mockDeal._id}/eligibility/criteria`, 'View details'),
        ));

      it('allows the user to add a bond', () =>
        wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="link-add-bond"]').toLinkTo(`/contract/${mockDeal._id}/bond/create`, 'Add a Bond')));

      it('provides a link to the bond', () => {
        const dealId = mockDeal._id;
        const bondId = mockDeal.bondTransactions.items[0]._id;

        return wrappers.forEach((wrapper) =>
          wrapper.expectLink(`[data-cy="name-link-${bondId}"]`).toLinkTo(`/contract/${dealId}/bond/${bondId}/details`, mockDeal.bondTransactions.items[0].name),
        );
      });

      it('renders bond transactions table', () => wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="bond-transactions-table"]').toExist()));

      it('allows the user to add a loan', () =>
        wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="link-add-loan"]').toLinkTo(`/contract/${mockDeal._id}/loan/create`, 'Add a Loan')));

      it('renders loan transactions table', () => wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="loan-transactions-table"]').toExist()));
    });

    describe('when viewed with editable=false', () => {
      const wrappers = [];

      beforeAll(() => {
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              deal,
              editable: false,
              ...confirmedRequestStartDateParams,
            }),
          );
        }
      });

      it('hides the link to the about supply contract section', () =>
        wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]').notToExist()));

      it('hides the link to the eligibility criteria section', () => wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="ViewDetails"]').notToExist()));

      it('hides the link to add a bond', () => wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="link-add-bond"]').notToExist()));

      it('hides the link to delete a bond', () => {
        const bondId = mockDeal.bondTransactions.items[0]._id;
        return wrappers.forEach((wrapper) => wrapper.expectLink(`[data-cy="delete-bond-${bondId}"]`).notToExist());
      });

      it('hides the link to the bond', () => {
        const bondId = mockDeal.bondTransactions.items[0]._id;
        return wrappers.forEach((wrapper) => wrapper.expectLink(`[data-cy="name-link-${bondId}"]`).notToExist());
      });

      it('hides the link to add a loan', () => wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="link-add-loan"]').notToExist()));

      it('hides the link to the loan', () => {
        const loanId = mockDeal.loanTransactions.items[0]._id;

        return wrappers.forEach((wrapper) => wrapper.expectLink(`[data-cy="loan-bank-reference-number-link-${loanId}"]`).notToExist());
      });
    });

    describe('when viewed with no bonds', () => {
      const wrappers = [];
      const dealWithNoBonds = {
        ...mockDeal,
        bondTransactions: {
          items: [],
        },
      };

      beforeAll(() => {
        // eslint-disable-next-line no-unused-vars
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              dealWithNoBonds,
            }),
          );
        }
      });

      it('should NOT render bond transactions table', () =>
        wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="bond-transactions-table"]').notToExist()));
    });

    describe('when viewed with no loans', () => {
      const wrappers = [];
      const dealWithNoLoans = {
        ...mockDeal,
        loanTransactions: {
          items: [],
        },
      };

      beforeAll(() => {
        // eslint-disable-next-line no-unused-vars
        for (const deal of oneDealInEachStatus()) {
          wrappers.push(
            render({
              user,
              dealWithNoLoans,
            }),
          );
        }
      });

      it('should NOT render loan transactions table', () =>
        wrappers.forEach((wrapper) => wrapper.expectElement('[data-cy="loan-transactions-table"]').notToExist()));
    });
  }
});
