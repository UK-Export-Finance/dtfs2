import moment from 'moment';

const componentRenderer = require('../../componentRenderer');

const component = 'contract/components/bond-transactions-table.njk';
const render = componentRenderer(component);

describe(component, () => {
  const deal = {
    submissionType: 'Manual Inclusion Application',
    status: "Ready for Checker's approval",
    bondTransactions: {
      items: [
        {
          _id: '5f3ab3f705e6630007dcfb21',
          ukefFacilityId: '5678',
          status: 'Incomplete',
          value: '100',
          currency: { id: 'GBP' },
          facilityStage: 'Unissued',
          hasBeenIssued: false,
          requestedCoverStartDate: moment().utc().valueOf(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
        {
          _id: '5f3ab3f705e6630007dcfb22',
          ukefFacilityId: '5678',
          status: 'Incomplete',
          value: '100',
          currency: { id: 'GBP' },
          facilityStage: 'Unissued',
          hasBeenIssued: false,
          requestedCoverStartDate: moment().utc().valueOf(),
          name: '1234',
          canIssueOrEditIssueFacility: true,
        },
      ],
    },
  };

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

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-requested-cover-start-date"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-cover-end-date"]`).toExist();
        });
      });

      it('should NOT display a `change start date`', () => {
        const wrapper = render({
          user,
          deal,
          confirmedRequestedCoverStartDates: [],
          editable: true,
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).notToExist();
        });
      });
    });
  }

  describe('when user is maker', () => {
    const user = { roles: ['maker'], timezone: 'Europe/London' };

    commonTests(user);

    describe('table rows', () => {
      it('should render bond issue facility element', () => {
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
      it('should render `change start date` link and NOT `issue facility link', () => {
        const dealWithBondsThatCanChangeCoverDate = deal;
        dealWithBondsThatCanChangeCoverDate.status = 'Acknowledged';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].facilityStage = 'Issued';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].hasBeenIssued = true;
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].issueFacilityDetailsSubmitted = true;

        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].facilityStage = 'Issued';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].hasBeenIssued = true;
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].issueFacilityDetailsSubmitted = true;

        const wrapper = render({
          user,
          deal: dealWithBondsThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).toExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });
  });

  describe('when user is checker', () => {
    const user = { roles: ['checker'], timezone: 'Europe/London' };

    commonTests(user);

    describe('table rows', () => {
      it('should render bond issue facility element', () => {
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
      it('should render `issue facility link` link and NOT `issue-or-delete-facility-link`', () => {
        const dealWithBondsThatCanChangeCoverDate = deal;
        dealWithBondsThatCanChangeCoverDate.status = 'Acknowledged';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].facilityStage = 'Issued';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].hasBeenIssued = true;
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].issueFacilityDetailsSubmitted = true;

        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].facilityStage = 'Issued';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].hasBeenIssued = true;
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].issueFacilityDetailsSubmitted = true;

        const wrapper = render({
          user,
          deal: dealWithBondsThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).notToExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).toExist();
        });
      });
    });
  });

  describe('when user is read-only', () => {
    const user = { roles: ['read-only'], timezone: 'Europe/London' };

    commonTests(user);

    describe('when a bond Cover Date can be modified', () => {
      it('should NOT render `issue facility link` link or an `issue-or-delete-facility-link`', () => {
        const dealWithBondsThatCanChangeCoverDate = deal;
        dealWithBondsThatCanChangeCoverDate.status = 'Acknowledged';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].facilityStage = 'Issued';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].hasBeenIssued = true;
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[0].issueFacilityDetailsSubmitted = true;

        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].facilityStage = 'Issued';
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].hasBeenIssued = true;
        dealWithBondsThatCanChangeCoverDate.bondTransactions.items[1].issueFacilityDetailsSubmitted = true;

        const wrapper = render({
          user,
          deal: dealWithBondsThatCanChangeCoverDate,
          confirmedRequestedCoverStartDates: [],
        });

        deal.bondTransactions.items.forEach((facility) => {
          const facilityIdSelector = `[data-cy="bond-${facility._id}"]`;

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-change-or-confirm-cover-start-date-${facility._id}"]`).notToExist();

          wrapper.expectElement(`${facilityIdSelector} [data-cy="bond-issue-facility-${facility._id}"]`).notToExist();
        });
      });
    });
  });
});
