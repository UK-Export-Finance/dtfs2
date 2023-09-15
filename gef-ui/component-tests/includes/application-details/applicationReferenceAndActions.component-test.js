const pageRenderer = require('../../pageRenderer');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');
const { MAKER, READ_ONLY } = require('../../../server/constants/roles');

const page = 'includes/application-details/applicationReferenceAndActions.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const dealId = '61e54dd5b578247e14575882';
  const status = 'Ready for Checker\'s approval';
  const abandon = true;
  const hasChangedFacilities = false;
  const MIAReturnToMaker = false;
  const returnToMakerNoFacilitiesChanged = false;
  const isAdmin = false;

  describe('when viewed without the userRoles param', () => {
    beforeEach(() => {
      wrapper = render({
        dealId,
        status,
      });
    });

    it('should not render the \'Clone\' button', () => {
      wrapper.expectLink('[data-cy="clone-gef-deal-link"]').notToExist();
    });
  });

  describe(`when viewed with the role '${MAKER}'`, () => {
    beforeEach(() => {
      wrapper = render({
        dealId,
        userRoles: [MAKER],
        status,
      });
    });

    it('should render the \'Clone\' button', () => {
      wrapper.expectLink('[data-cy="clone-gef-deal-link"]').toLinkTo(`${dealId}/clone`, 'Clone');
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with the role \'%s\'', (nonMakerRole) => {
    beforeEach(() => {
      wrapper = render({
        dealId,
        userRoles: [nonMakerRole],
        status,
        abandon,
        hasChangedFacilities,
        MIAReturnToMaker,
        returnToMakerNoFacilitiesChanged,
        isAdmin,
      });
    });

    it('should NOT render the \'Clone\' button', () => {
      wrapper.expectLink('[data-cy="clone-gef-deal-link"]').notToExist();
    });

    if (nonMakerRole === READ_ONLY) {
      it('should NOT render the \'Abandon\' button', () => {
        wrapper.expectLink('[data-cy="abandon-link"]').notToExist();
      });

      it('should NOT render the link to edit the bank\'s internal reference', () => {
        wrapper.expectLink('[data-cy="edit-refname-link"]').notToExist();
      });

      it('should NOT render the link to add an additional reference or edit it', () => {
        wrapper.expectLink('[data-cy="edit-addrefname-link"]').notToExist();
      });
    }
  });
});
