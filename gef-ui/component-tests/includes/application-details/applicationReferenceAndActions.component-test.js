const pageRenderer = require('../../pageRenderer');
const { NON_MAKER_ROLES } = require('../../../test-helpers/common-role-lists');
const { MAKER, READ_ONLY } = require('../../../server/constants/roles');

const page = 'includes/application-details/applicationReferenceAndActions.njk';
const render = pageRenderer(page);

describe(page, () => {
  let wrapper;
  const status = 'Ready for Checker\'s approval';
  const abandon = true;
  const hasChangedFacilities = false;
  const MIAReturnToMaker = false;
  const returnToMakerNoFacilitiesChanged = false;
  const isAdmin = false;

  describe(`when viewed with the role '${MAKER}'`, () => {
    beforeEach(() => {
      wrapper = render({
        userRoles: [MAKER],
        status,
      });
    });

    it('should render the \'Clone\' button', () => {
      wrapper.expectElement('[data-cy="clone-gef-deal-link"]').toExist();
    });
  });

  describe.each(NON_MAKER_ROLES)('when viewed with the role \'%s\'', (nonMakerRole) => {
    beforeEach(() => {
      wrapper = render({
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
      wrapper.expectElement('[data-cy="clone-gef-deal-link"]').notToExist();
    });

    if (nonMakerRole === READ_ONLY) {
      it('should NOT render the \'Abandon\' button', () => {
        wrapper.expectElement('[data-cy="abandon-link"]').notToExist();
      });

      it('should NOT render the link to edit the bank\'s internal reference', () => {
        wrapper.expectElement('[data-cy="edit-refname-link"]').notToExist();
      });

      it('should NOT render the link to add an additional reference or edit it', () => {
        wrapper.expectElement('[data-cy="edit-addrefname-link"]').notToExist();
      });
    }
  });
});
