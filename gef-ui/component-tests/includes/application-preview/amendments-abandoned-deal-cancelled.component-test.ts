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

  describe('cancelledDealWithAmendments does not exist', () => {
    it(`should NOT render the banner`, () => {
      wrapper = render({
        ...params,
      });

      wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
    });
  });

  describe('cancelledDealWithAmendments as false', () => {
    it(`should NOT render the banner`, () => {
      wrapper = render({
        ...params,
        cancelledDealWithAmendments: false,
      });

      wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
    });
  });

  describe('cancelledDealWithAmendments as false', () => {
    it(`should NOT render the banner`, () => {
      wrapper = render({
        ...params,
        cancelledDealWithAmendments: undefined,
      });

      wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
    });
  });

  describe('cancelledDealWithAmendments as null', () => {
    it(`should NOT render the banner`, () => {
      wrapper = render({
        ...params,
        cancelledDealWithAmendments: null,
      });

      wrapper.expectElement(amendmentsAbandonedDealCancelledBanner).notToExist();
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
    });
  });
});
