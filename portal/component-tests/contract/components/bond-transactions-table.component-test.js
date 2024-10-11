const {
  ROLES,
  TIMEZONES: { LONDON },
} = require('@ukef/dtfs2-common');
const { DEAL, FACILITY } = require('../../../server/constants/status');
const { getNowAsEpoch } = require('../../../server/helpers');

const { NON_MAKER_OR_CHECKER_ROLES } = require('../../../test-helpers/common-role-lists');

const componentRenderer = require('../../componentRenderer');

const { MAKER, CHECKER } = ROLES;

const component = 'contract/components/bond-transactions-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  const deal = {
    submissionType: 'Manual Inclusion Application',
    status: DEAL.READY_FOR_APPROVAL,
    bondTransactions: {
      items: [
        {
          _id: '5f3ab3f705e6630007dcfb21',
          ukefFacilityId: '5678',
          status: FACILITY.INCOMPLETE,
          value: '100',
          currency: { id: 'GBP' },
          facilityStage: 'Unissued',
          hasBeenIssued: false,
          requestedCoverStartDate: getNowAsEpoch(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
        {
          _id: '5f3ab3f705e6630007dcfb22',
          ukefFacilityId: '5678',
          status: FACILITY.INCOMPLETE,
          value: '100',
          currency: { id: 'GBP' },
          facilityStage: 'Unissued',
          hasBeenIssued: false,
          requestedCoverStartDate: getNowAsEpoch(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
      ],
    },
  };

  const dealWithBondsThatCanChangeCoverDate = JSON.parse(JSON.stringify(deal));
  dealWithBondsThatCanChangeCoverDate.status = DEAL.UKEF_ACKNOWLEDGED;
  dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].facilityStage = 'Issued';
  dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].hasBeenIssued = true;
  dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].issueFacilityDetailsSubmitted = true;

  dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].facilityStage = 'Issued';
  dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].hasBeenIssued = true;
  dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].issueFacilityDetailsSubmitted = true;

  describe('when user is maker', () => {
    const user = { roles: [MAKER], timezone: 'Europe/London' };

    commonTests(user);

    describe('table rows', () => {
      it('should render columns/elements/text for each bond', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).toExist();
        });
      });
    });

    describe('when a bond Cover Date can be modified', () => {
      it('should render `change or confirm cover start date` link and NOT `issue facility`', () => {
        const wrapper = render({
          user,
          deal: dealWithBondsThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        dealWithBondsThatCanChangeCoverDate.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });
  });

  describe('when user is checker', () => {
    const user = { roles: [CHECKER], timezone: LONDON };

    commonTests(user);

    describe('table rows', () => {
      it('should NOT render columns/elements/text for each bond', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });

    describe('when a bond Cover Date can be modified', () => {
      it('should NOT render `issue facility` link and NOT `change or confirm cover start date`', () => {
        const wrapper = render({
          user,
          deal: dealWithBondsThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        dealWithBondsThatCanChangeCoverDate.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).notToExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });
  });

  describe.each(NON_MAKER_OR_CHECKER_ROLES)('when user is %s', (nonMakerOrCheckerRole) => {
    const user = { roles: [nonMakerOrCheckerRole], timezone: LONDON };

    commonTests(user);

    describe('table rows', () => {
      it('should NOT render columns/elements/text for each bond', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });

    describe('when a bond Cover Date can be modified', () => {
      it('should NOT render `issue facility` link and NOT `change or confirm cover start date`', () => {
        const wrapper = render({
          user,
          deal: dealWithBondsThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        dealWithBondsThatCanChangeCoverDate.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).notToExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });
  });

  function commonTests(user) {
    describe('table headings', () => {
      it('should be rendered', () => {
        const wrapper = render({ user, deal, confirmedRequestedCoverStartDates: [] });
        wrapper.expectText('[data-cy="bonds-table-header-unique-number"]').toRead("Bond's unique number");
        wrapper.expectText('[data-cy="bonds-table-header-ukef-facility-id"]').toRead('UKEF facility ID');
        wrapper.expectText('[data-cy="bonds-table-header-status"]').toRead('Status');
        wrapper.expectText('[data-cy="bonds-table-header-value"]').toRead('Value');
        wrapper.expectText('[data-cy="bonds-table-header-stage"]').toRead('Stage');
        wrapper.expectText('[data-cy="bonds-table-header-start-date"]').toRead('Start date');
        wrapper.expectText('[data-cy="bonds-table-header-end-date"]').toRead('End date');
        wrapper.expectText('[data-cy="bonds-table-header-action"]').toRead('Action');
      });
    });

    describe('table rows', () => {
      it('should render columns/elements/text for each bond', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="name-link-${facility._id}"]`).toExist();

          wrapper.expectText(`${facilityIdSelector} [data-cy="bond-ukef-facility-id-${facility._id}"]`).toRead(facility.ukefFacilityId);

          wrapper.expectText(`${facilityIdSelector} [data-cy="bond-status-${facility._id}"] [data-cy="status-tag"]`).toRead(facility.status);

          wrapper.expectText(`${facilityIdSelector} [data-cy="bond-facility-value"]`).toRead(`${facility.currency.id} ${facility.value}`);

          wrapper.expectText(`${facilityIdSelector} [data-cy="facility-stage-${facility._id}"]`).toRead(facility.facilityStage);

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-requested-cover-start-date-${facility._id}"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-cover-end-date-${facility._id}"]`).toExist();
        });
      });
    });
  }
});
