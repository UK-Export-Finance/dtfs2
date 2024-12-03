const { CURRENCY, ROLES, timezoneConfig } = require('@ukef/dtfs2-common');
const { UNCONDITIONAL } = require('../../../server/constants/facility-stage');
const { getNowAsEpoch } = require('../../../server/helpers');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');

const { MAKER } = ROLES;

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/loan-transactions-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  const deal = {
    submissionType: 'Manual Inclusion Application',
    status: "Ready for Checker's approval",
    loanTransactions: {
      items: [
        {
          _id: '1',
          ukefFacilityId: '5678',
          status: 'Incomplete',
          value: '100',
          currency: { id: CURRENCY.GBP },
          facilityStage: 'Conditional',
          hasBeenIssued: false,
          requestedCoverStartDate: getNowAsEpoch(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
        {
          _id: '2',
          ukefFacilityId: '5678',
          status: 'Incomplete',
          value: '100',
          currency: { id: CURRENCY.GBP },
          facilityStage: 'Conditional',
          hasBeenIssued: false,
          requestedCoverStartDate: getNowAsEpoch(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
      ],
    },
  };

  const dealWithLoansThatCanChangeCoverDate = JSON.parse(JSON.stringify(deal));
  dealWithLoansThatCanChangeCoverDate.status = 'Acknowledged';
  dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].facilityStage = UNCONDITIONAL;
  dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].hasBeenIssued = true;
  dealWithLoansThatCanChangeCoverDate.loanTransactions.items[0].issueFacilityDetailsSubmitted = true;

  dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].facilityStage = UNCONDITIONAL;
  dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].hasBeenIssued = true;
  dealWithLoansThatCanChangeCoverDate.loanTransactions.items[1].issueFacilityDetailsSubmitted = true;

  describe('as a maker', () => {
    const user = { roles: [MAKER], timezone: timezoneConfig.DEFAULT };

    commonTests(user);

    describe('table rows', () => {
      it('should render columns/elements/text for each loan', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).toExist();
        });
      });

      it('should render a hyperlink for the start date of each loan', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-bank-reference-number-link-${facility._id}"]`).toExist();
          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-bank-reference-number-${facility._id}"]`).notToExist();
        });
      });

      describe('when a loan Cover Date cannot be modified', () => {
        it('should render `issue facility link` link and NOT `change or confirm start date`', () => {
          const dealWithLoansThatCannotChangeCoverDate = deal;
          dealWithLoansThatCannotChangeCoverDate.status = "Maker's input required";

          const wrapper = render({
            user,
            deal: dealWithLoansThatCannotChangeCoverDate,
            confirmedRequestedCoverStartDates: [],
          });

          deal.loanTransactions.items.forEach((facility) => {
            const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

            wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-change-or-confirm-cover-start-date-${facility._id}"]`).notToExist();
            wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).toExist();
          });
        });
      });

      describe('when a loan Cover Date can be modified', () => {
        it('should render `change or confirm start date` link and NOT `issue facility link`', () => {
          const wrapper = render({
            user,
            deal: dealWithLoansThatCanChangeCoverDate,
            confirmedRequestedCoverStartDates: [],
          });

          dealWithLoansThatCanChangeCoverDate.loanTransactions.items.forEach((facility) => {
            const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

            wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-change-or-confirm-cover-start-date-${facility._id}"]`).toExist();
            wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).notToExist();
          });
        });
      });
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with the role %s', (nonMakerRole) => {
    const user = { roles: [nonMakerRole], timezone: timezoneConfig.DEFAULT };

    commonTests(user);

    describe('table rows', () => {
      it('should not render columns/elements/text for each loan', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-issue-facility-${facility._id}"]`).notToExist();
        });
      });

      it('should not render a hyperlink for the start date of each loan', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-bank-reference-number-link-${facility._id}"]`).notToExist();
          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-bank-reference-number-${facility._id}"]`).toExist();
        });
      });
    });
  });

  function commonTests(user) {
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
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.loanTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="loan-${facility._id}"]`;

          wrapper.expectElement();

          wrapper.expectText(`${facilityIdSelector} [data-cy="loan-ukef-facility-id-${facility._id}"]`).toRead(facility.ukefFacilityId);

          wrapper.expectText(`${facilityIdSelector} [data-cy="loan-status-${facility._id}"] [data-cy="status-tag"]`).toRead(facility.status);

          wrapper.expectText(`${facilityIdSelector} [data-cy="loan-facility-value"]`).toRead(`${facility.currency.id} ${facility.value}`);

          wrapper.expectText(`${facilityIdSelector} [data-cy="loan-facility-stage-${facility._id}"]`).toRead(facility.facilityStage);

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-requested-cover-start-date-${facility._id}"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="loan-cover-end-date-${facility._id}"]`).toExist();
        });
      });
    });
  }
});
