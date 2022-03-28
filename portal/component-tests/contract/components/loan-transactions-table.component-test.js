import moment from 'moment';

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/loan-transactions-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  const user = { roles: ['maker'], timezone: 'Europe/London' };

  const deal = {
    submissionType: 'Manual Inclusion Application',
    status: 'Ready for Checker\'s approval',
    loanTransactions: {
      items: [
        {
          _id: '1',
          ukefFacilityId: '5678',
          status: 'Incomplete',
          value: '100',
          currency: { id: 'GBP' },
          facilityStage: 'Conditional',
          hasBeenIssued: false,
          requestedCoverStartDate: moment().utc().valueOf(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
        {
          _id: '2',
          ukefFacilityId: '5678',
          status: 'Incomplete',
          value: '100',
          currency: { id: 'GBP' },
          facilityStage: 'Conditional',
          hasBeenIssued: false,
          requestedCoverStartDate: moment().utc().valueOf(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
      ],
    },
  };

  describe('table headings', () => {
    it('should be rendered', () => {
      const wrapper = render({ user, deal, confirmedRequestedCoverStartDates: [] });

      wrapper.expectText('[data-cy="loans-table-header-bank-reference-number"]').toRead('Bank reference number');
      wrapper.expectText('[data-cy="loans-table-header-ukef-facility-id"]').toRead('UKEF facility ID');
      wrapper.expectText('[data-cy="loans-table-header-status"]').toRead('Status');
      wrapper.expectText('[data-cy="loans-table-header-value"]').toRead('Value');
      wrapper.expectText('[data-cy="loans-table-header-stage"]').toRead('Stage');
      wrapper.expectText('[data-cy="loans-table-header-start-date"]').toRead('Start date');
      wrapper.expectText('[data-cy="loans-table-header-end-date"]').toRead('End date');
      wrapper.expectText('[data-cy="loans-table-header-action"]').toRead('Action');
    });
  });

  describe('table rows', () => {
    it('should render columns/elements/text for each loan', () => {
      const wrapper = render({
        user, deal, confirmedRequestedCoverStartDates: [], editable: true,
      });

      deal.loanTransactions.items.forEach((facility) => {
        const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

        wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-bank-reference-number-link-${facility._id}"]`).toExist();

        wrapper.expectText(`${facilityIdSelector} [data-cy="loan-ukef-facility-id-${facility._id}"]`).toRead(facility.ukefFacilityId);

        wrapper.expectText(`${facilityIdSelector} [data-cy="loan-status-${facility._id}"] [data-cy="status-tag"]`).toRead(facility.status);

        wrapper.expectText(`${facilityIdSelector} [data-cy="loan-facility-value"]`).toRead(`${facility.currency.id} ${facility.value}`);

        wrapper.expectText(`${facilityIdSelector} [data-cy="loan-facility-stage-${facility._id}"]`).toRead(facility.facilityStage);

        wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-requested-cover-start-date"]`).toExist();

        wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-cover-end-date"]`).toExist();

        wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).toExist();
      });
    });

    describe('when a loan Cover Date can be modified', () => {
      it('should render `change start date` link and NOT `issue facility link', () => {
        const dealWithLoansThatCanChangeCoverDate = deal;
        dealWithLoansThatCanChangeCoverDate.status = 'Acknowledged';
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].facilityStage = 'Unconditional';
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].hasBeenIssued = true;
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].issueFacilityDetailsSubmitted = true;

        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].facilityStage = 'Unconditional';
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].hasBeenIssued = true;
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].issueFacilityDetailsSubmitted = true;

        const wrapper = render({
          user,
          deal: dealWithLoansThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-change-or-confirm-cover-start-date-${facility._id}"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });

    describe('when viewed by maker-checker role', () => {
      const makerCheckerUser = { roles: ['maker', 'checker'], timezone: 'Europe/London' };

      it('should render `change start date` link', () => {
        const dealWithLoansThatCanChangeCoverDate = deal;
        dealWithLoansThatCanChangeCoverDate.status = 'Acknowledged';
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].facilityStage = 'Unconditional';
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].hasBeenIssued = true;
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].issueFacilityDetailsSubmitted = true;

        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].facilityStage = 'Unconditional';
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].hasBeenIssued = true;
        dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].issueFacilityDetailsSubmitted = true;

        const wrapper = render({
          user: makerCheckerUser,
          deal: dealWithLoansThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-change-or-confirm-cover-start-date-${facility._id}"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });
  });
});
