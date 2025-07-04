import { PORTAL_AMENDMENT_STATUS, ROLES } from '@ukef/dtfs2-common';
import pageRenderer from '../../pageRenderer';

const page = 'includes/application-preview/amendments-abandoned-deal-cancelled.njk';
const render = pageRenderer(page);

const params = {
  displayComments: true,
  dealId: '123',
  userRoles: [ROLES.MAKER],
  hasReadyForCheckerAmendments: false,
  hasFurtherMakersInputAmendments: false,
  readyForCheckerAmendmentDetailsUrlAndText: [],
  furtherMakersInputAmendmentDetailsUrlAndText: [],
  readyForCheckerAmendmentStatusHeading: PORTAL_AMENDMENT_STATUS.READY_FOR_CHECKERS_APPROVAL,
  furtherMakersInputAmendmentStatusHeading: PORTAL_AMENDMENT_STATUS.FURTHER_MAKERS_INPUT_REQUIRED,
};

describe(page, () => {
  let wrapper;

  const amendmentsAbandonedDealCancelledBanner = `[data-cy="amendments-abandoned-deal-cancelled-banner"]`;
  const amendmentsAbandonedDealPendingCancellationBanner = `[data-cy="amendments-abandoned-deal-pending-cancellation-banner"]`;

  describe('cancelledDealWithAmendments', () => {
    describe('cancelledDealWithAmendments does not exist', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('cancelledDealWithAmendments as false', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
          cancelledDealWithAmendments: false,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('cancelledDealWithAmendments as undefined', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
          cancelledDealWithAmendments: undefined,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('cancelledDealWithAmendments as null', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
          cancelledDealWithAmendments: null,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('cancelledDealWithAmendments as true', () => {
      it(`should render the banner`, () => {
        wrapper = render({
          ...params,
          cancelledDealWithAmendments: true,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).toExist();
        wrapper
          .expectText(amendmentsAbandonedDealCancelledBanner)
          .toRead('Any amendments in progress have been abandoned by UKEF, as the deal is now cancelled.');

        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });
  });

  describe('pendingCancellationDealWithAmendments', () => {
    describe('pendingCancellationDealWithAmendments as false', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
          pendingCancellationDealWithAmendments: false,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('pendingCancellationDealWithAmendments as undefined', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
          pendingCancellationDealWithAmendments: undefined,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('pendingCancellationDealWithAmendments as null', () => {
      it(`should NOT render the banner`, () => {
        wrapper = render({
          ...params,
          pendingCancellationDealWithAmendments: null,
        });

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).notToExist();
      });
    });

    describe('pendingCancellationDealWithAmendments as true', () => {
      it(`should render the banner`, () => {
        wrapper = render({
          ...params,
          pendingCancellationDealWithAmendments: true,
        });

        wrapper.expectElement(amendmentsAbandonedDealPendingCancellationBanner).toExist();
        wrapper
          .expectText(amendmentsAbandonedDealPendingCancellationBanner)
          .toRead('Any amendments in progress have been abandoned by UKEF, as the deal is pending cancellation.');

        wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
      });
    });
  });
});
