import { STATUS } from '../../server/constants';

const pageRenderer = require('../pageRenderer');

const page = 'contract/contract-view.njk';
const render = pageRenderer(page);
const dealFullyCompleted = require('../fixtures/deal-fully-completed');
const { MAKER, CHECKER, READ_ONLY } = require('../../server/constants/roles');

const mockDeal = { _id: '61f6fbaea2460c018a4189d7', ...dealFullyCompleted };
mockDeal.bondTransactions.items[0]._id = '61f6fbaea2460c018a4189d8';

const aDealInStatus = (status) => ({
  ...mockDeal,
  status,
});

const oneDealInEachStatus = () => [
  aDealInStatus(STATUS.DRAFT),
  aDealInStatus(STATUS.READY_FOR_APPROVAL),
  aDealInStatus(STATUS.CHANGES_REQUIRED),
  aDealInStatus(STATUS.ABANDONED),
  aDealInStatus(STATUS.SUBMITTED_TO_UKEF),
  aDealInStatus(STATUS.UKEF_ACKNOWLEDGED),
  aDealInStatus(STATUS.UKEF_APPROVED_WITHOUT_CONDITIONS),
  aDealInStatus(STATUS.APPROVEDWithConditions),
  aDealInStatus(STATUS.UKEF_REFUSED),
];

const confirmedRequestStartDateParams = {
  confirmedRequestedCoverStartDates: [],
  allRequestedCoverStartDatesConfirmed: true,
};

describe(page, () => {
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
          wrapper.expectLink('[data-cy="ViewAboutSupplierDetails"]').toLinkTo(`/contract/${mockDeal._id}/about/supplier`, 'View details')));

      it('links to the eligibility criteria section', () =>
        wrappers.forEach((wrapper) =>
          wrapper.expectLink('[data-cy="ViewDetails"]').toLinkTo(`/contract/${mockDeal._id}/eligibility/criteria`, 'View details')));

      it('allows the user to add a bond', () =>
        wrappers.forEach((wrapper) => wrapper.expectLink('[data-cy="link-add-bond"]').toLinkTo(`/contract/${mockDeal._id}/bond/create`, 'Add a Bond')));

      it('provides a link to the bond', () => {
        const dealId = mockDeal._id;
        const bondId = mockDeal.bondTransactions.items[0]._id;

        return wrappers.forEach((wrapper) =>
          wrapper.expectLink(`[data-cy="name-link-${bondId}"]`).toLinkTo(`/contract/${dealId}/bond/${bondId}/details`, mockDeal.bondTransactions.items[0].name));
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

  describe("when viewed as a 'maker'", () => {
    const user = { roles: [MAKER], timezone: 'Europe/London' };

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
            .toLinkTo(`/contract/${dealId}/loan/${loanId}/guarantee-details`, mockDeal.loanTransactions.items[0].name));
      });
    });
  });

  describe("when viewed as a 'checker'", () => {
    const user = { roles: [CHECKER], timezone: 'Europe/London' };

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

  describe("when viewed as a 'read-only'", () => {
    const user = { roles: [READ_ONLY], timezone: 'Europe/London' };

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
});
