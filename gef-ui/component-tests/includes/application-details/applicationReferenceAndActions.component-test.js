const { DEAL_STATUS } = require('@ukef/dtfs2-common');
const pageRenderer = require('../../pageRenderer');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');
const { MAKER } = require('../../../server/constants/roles');

const page = 'includes/application-details/applicationReferenceAndActions.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const dealId = '61e54dd5b578247e14575882';
  const status = "Ready for Checker's approval";
  const canCloneDeal = (dealStatus) => ![DEAL_STATUS.CANCELLED, DEAL_STATUS.PENDING_CANCELLATION].includes(dealStatus);

  describe("the 'Clone' button", () => {
    const cloneButtonSelector = '[data-cy="clone-gef-deal-link"]';

    it('should not render when the page is rendered without the userRoles param', () => {
      wrapper = render({
        dealId,
        status,
        canCloneDeal: canCloneDeal(status),
      });
      wrapper.expectLink(cloneButtonSelector).notToExist();
    });

    it('should not render when the page is rendered without the status param', () => {
      wrapper = render({
        dealId,
        canCloneDeal: canCloneDeal(status),
        userRoles: [MAKER],
      });
      wrapper.expectLink(cloneButtonSelector).notToExist();
    });

    it(`should not render when the page is rendered with status ${DEAL_STATUS.CANCELLED}`, () => {
      wrapper = render({
        dealId,
        status: DEAL_STATUS.CANCELLED,
        canCloneDeal: canCloneDeal(DEAL_STATUS.CANCELLED),
        userRoles: [MAKER],
      });
      wrapper.expectLink(cloneButtonSelector).notToExist();
    });

    it(`should not render when the page is rendered with status ${DEAL_STATUS.PENDING_CANCELLATION}`, () => {
      wrapper = render({
        dealId,
        status: DEAL_STATUS.PENDING_CANCELLATION,
        canCloneDeal: canCloneDeal(DEAL_STATUS.PENDING_CANCELLATION),
        userRoles: [MAKER],
      });
      wrapper.expectLink(cloneButtonSelector).notToExist();
    });

    it.each(NON_MAKER_ROLES)('should not render when the page is rendered with the %s role only', (role) => {
      wrapper = render({
        dealId,
        status,
        canCloneDeal: canCloneDeal(status),
        userRoles: [role],
      });
      wrapper.expectLink(cloneButtonSelector).notToExist();
    });

    it('should render when the page is rendered with the maker role only', () => {
      wrapper = render({
        dealId,
        status,
        canCloneDeal: canCloneDeal(status),
        userRoles: [MAKER],
      });
      wrapper.expectLink(cloneButtonSelector).toLinkTo(`${dealId}/clone`, 'Clone');
    });
  });
});
